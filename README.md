# SMS Scheduler

A full-stack application for scheduling SMS messages with Next.js frontend, Golang backend, and Twilio integration.

![Screenshot](public/screenshot.png) <!-- Add a screenshot if available -->

## Features

- 📅 Schedule SMS messages for future delivery
- 📱 View message history with status tracking (pending/sent/failed)
- ✏️ Edit or delete pending messages
- 🔔 Real-time status updates via Twilio webhooks
- 📊 Responsive UI with modern design

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React Hook Form
- Tailwind CSS
- Lucide Icons
- React Hot Toast

**Backend:**
- Golang 1.21+
- Gin Web Framework
- GORM (SQLite)
- Twilio Go SDK
- Cron for scheduling

**Services:**
- Twilio SMS API
- SQLite (can be configured for PostgreSQL/MySQL)

## Prerequisites

- Node.js 18+
- Go 1.21+
- Twilio account with SMS capabilities
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sms-scheduler.git
cd sms-scheduler
