package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/robfig/cron/v3"
	"github.com/twilio/twilio-go"
	api "github.com/twilio/twilio-go/rest/api/v2010"
	"gorm.io/driver/sqlite"
	"github.com/joho/godotenv"
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

type TwilioConfig struct {
	AccountSID string
	AuthToken  string
	FromNumber string
}

var twilioClient *twilio.RestClient
var twilioConfig TwilioConfig

// ScheduleMessageRequest represents the request body for scheduling a message
type ScheduleMessageRequest struct {
	PhoneNumber string `json:"phone_number" binding:"required"`
	Content     string `json:"content" binding:"required"`
	ScheduledAt string `json:"scheduled_at" binding:"required"` // ISO format
}

var db *gorm.DB
var scheduler *cron.Cron

func main() {
	if err := godotenv.Load(); err != nil {
    log.Println("No .env file found, using system environment variables")
}
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

	// Initialize Twilio client
	twilioConfig = TwilioConfig{
		AccountSID: os.Getenv("TWILIO_ACCOUNT_SID"),
		AuthToken:  os.Getenv("TWILIO_AUTH_TOKEN"),
		FromNumber: os.Getenv("TWILIO_PHONE_NUMBER"),
	}

	if twilioConfig.AccountSID == "" || twilioConfig.AuthToken == "" || twilioConfig.FromNumber == "" {
		log.Fatal("Twilio configuration missing. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables")
	}

	twilioClient = twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: twilioConfig.AccountSID,
		Password: twilioConfig.AuthToken,
	})

	// Routes
	r.POST("/api/schedule", scheduleMessage)
	r.POST("/api/message-status", handleMessageStatus)
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


// handleMessageStatus receives status updates from Twilio
func handleMessageStatus(c *gin.Context) {
    var status struct {
        MessageSID string `form:"MessageSid"`
        Status     string `form:"MessageStatus"`
        To         string `form:"To"`
    }

    if err := c.ShouldBind(&status); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Update your database with the delivery status
    result := db.Model(&Message{}).Where("phone_number = ?", status.To).Updates(map[string]interface{}{
        "status":     status.Status,
        "updated_at": time.Now(),
    })

    if result.Error != nil {
        log.Printf("Failed to update message status: %v", result.Error)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
        return
    }

    c.Status(http.StatusOK)
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
    
    result := db.Where("status = ? AND scheduled_at <= ?", "pending", now).Find(&messages)
    if result.Error != nil {
        log.Printf("Error fetching due messages: %v", result.Error)
        return
    }

    // Rate limit to 1 message per second
    limiter := time.Tick(1 * time.Second)
    
    for _, message := range messages {
        <-limiter // Wait for the rate limiter
        success := sendMessage(message)
        
        if success {
            message.Status = "sent"
        } else {
            message.Status = "failed"
        }
        
        message.UpdatedAt = time.Now()
        db.Save(&message)
    }
}

func sendMessage(message Message) bool {
    maxRetries := 3
    retryDelay := 2 * time.Second

    params := &api.CreateMessageParams{}
    params.SetTo(message.PhoneNumber)
    params.SetFrom(twilioConfig.FromNumber)
    params.SetBody(message.Content)

    for i := 0; i < maxRetries; i++ {
        resp, err := twilioClient.Api.CreateMessage(params)
        if err == nil && resp.Sid != nil {
            log.Printf("Message sent successfully to %s. SID: %s", message.PhoneNumber, *resp.Sid)
            return true
        }

        if i < maxRetries-1 {
            log.Printf("Attempt %d failed for %s: %v. Retrying...", i+1, message.PhoneNumber, err)
            time.Sleep(retryDelay)
        }
    }

    log.Printf("Failed to send message to %s after %d attempts", message.PhoneNumber, maxRetries)
    return false
}