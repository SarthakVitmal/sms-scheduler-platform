package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/robfig/cron/v3"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Message represents a scheduled message
type Message struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	PhoneNumber string    `json:"phone_number" gorm:"not null"`
	Content     string    `json:"content" gorm:"not null"`
	ScheduledAt time.Time `json:"scheduled_at" gorm:"not null"`
	Status      string    `json:"status" gorm:"default:'pending'"` // pending, sent, failed
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ScheduleMessageRequest represents the request body for scheduling a message
type ScheduleMessageRequest struct {
	PhoneNumber string `json:"phone_number" binding:"required"`
	Content     string `json:"content" binding:"required"`
	ScheduledAt string `json:"scheduled_at" binding:"required"` // ISO format
}

var db *gorm.DB
var scheduler *cron.Cron

func main() {
	// Initialize database
	initDB()

	// Initialize scheduler
	scheduler = cron.New()
	scheduler.Start()

	// Start background job to check for pending messages
	go messageProcessor()

	// Initialize Gin router
	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Routes
	r.POST("/api/schedule", scheduleMessage)
	r.GET("/api/messages", getMessages)
	r.PUT("/api/messages/:id", updateMessage)
	r.DELETE("/api/messages/:id", deleteMessage)

	fmt.Println("Server starting on :8080")
	log.Fatal(r.Run(":8080"))
}

func initDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("messages.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Migrate the schema
	err = db.AutoMigrate(&Message{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
}

func scheduleMessage(c *gin.Context) {
	var req ScheduleMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse scheduled time
	scheduledAt, err := time.Parse(time.RFC3339, req.ScheduledAt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use ISO 8601 format."})
		return
	}

	// Check if scheduled time is in the future
	if scheduledAt.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Scheduled time must be in the future"})
		return
	}

	// Create message
	message := Message{
		PhoneNumber: req.PhoneNumber,
		Content:     req.Content,
		ScheduledAt: scheduledAt,
		Status:      "pending",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	result := db.Create(&message)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to schedule message"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Message scheduled successfully",
		"data":    message,
	})
}

func getMessages(c *gin.Context) {
	var messages []Message
	result := db.Order("scheduled_at DESC").Find(&messages)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"messages": messages,
	})
}

func updateMessage(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message ID"})
		return
	}

	var req ScheduleMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse scheduled time
	scheduledAt, err := time.Parse(time.RFC3339, req.ScheduledAt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	// Find and update message
	var message Message
	result := db.First(&message, uint(id))
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Message not found"})
		return
	}

	// Only allow updates if message is still pending
	if message.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot update sent or failed messages"})
		return
	}

	message.PhoneNumber = req.PhoneNumber
	message.Content = req.Content
	message.ScheduledAt = scheduledAt
	message.UpdatedAt = time.Now()

	db.Save(&message)

	c.JSON(http.StatusOK, gin.H{
		"message": "Message updated successfully",
		"data":    message,
	})
}

func deleteMessage(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message ID"})
		return
	}

	result := db.Delete(&Message{}, uint(id))
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete message"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Message not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Message deleted successfully",
	})
}

// messageProcessor runs in background to check for messages to send
func messageProcessor() {
	ticker := time.NewTicker(30 * time.Second) // Check every 30 seconds
	defer ticker.Stop()

	for range ticker.C {
		sendDueMessages()
	}
}

func sendDueMessages() {
	var messages []Message
	now := time.Now()
	
	// Find messages that are due to be sent
	result := db.Where("status = ? AND scheduled_at <= ?", "pending", now).Find(&messages)
	if result.Error != nil {
		log.Printf("Error fetching due messages: %v", result.Error)
		return
	}

	for _, message := range messages {
		success := sendMessage(message)
		
		// Update message status
		if success {
			message.Status = "sent"
			log.Printf("Message sent successfully to %s", message.PhoneNumber)
		} else {
			message.Status = "failed"
			log.Printf("Failed to send message to %s", message.PhoneNumber)
		}
		
		message.UpdatedAt = time.Now()
		db.Save(&message)
	}
}

// sendMessage simulates sending a message (replace with actual SMS API)
func sendMessage(message Message) bool {
	// This is a simulation. In production, you would integrate with:
	// - Twilio API
	// - AWS SNS
	// - Firebase Cloud Messaging
	// - Any other SMS service provider
	
	log.Printf("Sending message to %s: %s", message.PhoneNumber, message.Content)
	
	// Simulate API call delay
	time.Sleep(1 * time.Second)
	
	// Simulate 95% success rate
	return time.Now().Unix()%20 != 0
}

// For production, replace sendMessage with actual SMS API integration:
/*
func sendMessage(message Message) bool {
	// Example with Twilio
	client := twilio.NewRestClient()
	
	params := &api.CreateMessageParams{}
	params.SetTo(message.PhoneNumber)
	params.SetFrom("+1234567890") // Your Twilio phone number
	params.SetBody(message.Content)
	
	resp, err := client.Api.CreateMessage(params)
	if err != nil {
		log.Printf("Error sending message: %v", err)
		return false
	}
	
	log.Printf("Message sent with SID: %s", *resp.Sid)
	return true
}
*/