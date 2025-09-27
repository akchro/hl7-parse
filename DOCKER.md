# HL7 LiteBoard Docker Documentation

This document provides comprehensive instructions for running HL7 LiteBoard using Docker.

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

### One-Command Setup
```bash
./scripts/docker-setup.sh dev
```

## Environment Options

### Development Environment
```bash
# Start development with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Or use the setup script
./scripts/docker-setup.sh dev
```

**Features:**
- Hot reload for frontend and backend
- pgAdmin for database management
- Mailhog for email testing
- Node.js debugging enabled on port 9229

**Access URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- pgAdmin: http://localhost:8080 (admin@hl7liteboard.com / admin123)
- Mailhog: http://localhost:8025

### Production Environment
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Or use the setup script
./scripts/docker-setup.sh prod
```

**Features:**
- Optimized builds
- Nginx load balancer with SSL support
- Redis for session storage
- Health checks and auto-restart
- Resource limits and security hardening

**Access URLs:**
- Frontend: http://localhost (port 80)
- HTTPS: https://localhost (port 443, when SSL configured)

### Basic Environment
```bash
# Start basic environment
docker-compose up -d

# Or use the setup script
./scripts/docker-setup.sh
```

### With Monitoring Stack
```bash
# Start with full monitoring
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Or use the setup script
./scripts/docker-setup.sh monitoring
```

**Additional Services:**
- Grafana: http://localhost:3000 (admin / admin123)
- Prometheus: http://localhost:9090
- Jaeger Tracing: http://localhost:16686
- Alertmanager: http://localhost:9093

## Configuration

### Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Key variables to configure:

#### Database
```env
DB_HOST=postgres
DB_PASSWORD=your-secure-password
```

#### Security
```env
JWT_SECRET=your-256-bit-secret
ENCRYPTION_KEY=your-32-character-key
```

#### Production URLs
```env
FRONTEND_URL=https://your-domain.com
```

### SSL Configuration

For production HTTPS:

1. Place SSL certificates in `nginx/ssl/`:
   ```
   nginx/ssl/cert.pem
   nginx/ssl/key.pem
   ```

2. Update nginx configuration in `nginx/conf.d/default.conf`

3. Restart nginx:
   ```bash
   docker-compose restart frontend
   ```

## Service Architecture

### Core Services
- **postgres**: PostgreSQL 15 database
- **backend**: Node.js API server with Express
- **frontend**: React app served by Nginx
- **redis**: Redis for caching and sessions

### Development Services
- **pgadmin**: Database administration
- **mailhog**: Email testing

### Monitoring Services
- **prometheus**: Metrics collection
- **grafana**: Dashboards and visualization
- **loki**: Log aggregation
- **jaeger**: Distributed tracing
- **alertmanager**: Alert routing

## Volumes and Data

### Persistent Data
- `postgres_data`: Database files
- `redis_data`: Redis persistence
- `backend_uploads`: File uploads
- `backend_logs`: Application logs

### Backup Data
```bash
# Backup database
docker exec hl7-postgres pg_dump -U hl7user hl7_liteboard > backup.sql

# Restore database
docker exec -i hl7-postgres psql -U hl7user hl7_liteboard < backup.sql
```

## Scaling and Performance

### Horizontal Scaling
```yaml
# In docker-compose.prod.yml
backend:
  deploy:
    replicas: 3  # Scale backend instances
```

### Resource Limits
```yaml
backend:
  deploy:
    resources:
      limits:
        memory: 512M
        cpus: '0.5'
```

## Troubleshooting

### Check Service Health
```bash
docker-compose ps
docker-compose logs [service-name]
```

### Common Issues

#### Database Connection Errors
```bash
# Check database is running
docker-compose logs postgres

# Check connection from backend
docker-compose exec backend npm run test:db
```

#### Frontend Build Errors
```bash
# Rebuild frontend
docker-compose build frontend --no-cache
```

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :5173
```

### Log Locations

#### Application Logs
```bash
# Backend logs
docker-compose logs backend

# Database logs
docker-compose logs postgres

# Nginx logs
docker-compose logs frontend
```

#### File System Logs
- Backend: `backend_logs` volume
- Nginx: Logged to stdout/stderr
- PostgreSQL: Logged to stdout/stderr

## Maintenance

### Updates
```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Cleanup
```bash
# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup (⚠️ removes all data)
docker-compose down -v
```

### Database Maintenance
```bash
# Connect to database
docker-compose exec postgres psql -U hl7user hl7_liteboard

# Run vacuum
docker-compose exec postgres psql -U hl7user -d hl7_liteboard -c "VACUUM ANALYZE;"
```

## Security Considerations

### Production Checklist
- [ ] Change default passwords in `.env`
- [ ] Configure SSL certificates
- [ ] Set up firewall rules
- [ ] Enable log monitoring
- [ ] Configure backup strategy
- [ ] Review file upload limits
- [ ] Set up intrusion detection

### Network Security
- All services run in isolated Docker networks
- Only necessary ports exposed to host
- Nginx acts as reverse proxy and SSL termination
- Rate limiting configured for API endpoints

## Performance Monitoring

### Key Metrics
- Response times: Backend `/health` endpoint
- Database performance: Connection pool usage
- Memory usage: Container resource monitoring
- Disk usage: Volume space monitoring

### Alerts
- Service health checks
- Database connection failures
- High memory usage
- Disk space warnings

## Backup Strategy

### Automated Backups
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

### Backup Script Example
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec hl7-postgres pg_dump -U hl7user hl7_liteboard | gzip > "backup_${DATE}.sql.gz"
```

## Support

### Getting Help
1. Check logs: `docker-compose logs [service]`
2. Verify configuration: Review `.env` file
3. Check service health: `docker-compose ps`
4. Review this documentation
5. Check GitHub issues

### Contributing
1. Fork the repository
2. Create feature branch
3. Test with Docker
4. Submit pull request

---

For more information, see the main [README.md](README.md) file.