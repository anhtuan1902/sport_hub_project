# Sport Hub Infrastructure

## Docker Commands

### Start All Services
```bash
cd infrastructure/docker
docker-compose up -d
```

### Start Only Database Services (without pgAdmin)
```bash
docker-compose up -d postgres redis
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Volumes (Complete Reset)
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Check Status
```bash
docker-compose ps
```

### Access PostgreSQL
```bash
docker exec -it sport-hub-db psql -U postgres -d sport_hub
```

### Access Redis CLI
```bash
docker exec -it sport-hub-redis redis-cli
```

### pgAdmin (Tools)
```bash
# Start pgAdmin
docker-compose --profile tools up -d pgadmin

# Access: http://localhost:5050
# Email: admin@sporthub.com
# Password: admin123
```

## Connection Details

### PostgreSQL
- Host: localhost
- Port: 5432
- Database: sport_hub
- Username: postgres
- Password: postgres123

### Redis
- Host: localhost
- Port: 6379
- No password (development mode)

### pgAdmin (Optional)
- URL: http://localhost:5050
- Email: admin@sporthub.com
- Password: admin123
