# Monitoring - Garbage Collection System

This directory contains configuration files for monitoring and observability.

## 📊 Stack

- **Prometheus**: For time-series data collection and alerting.
- **Grafana**: For visualizing metrics and creating dashboards.

## 📁 Directory Structure

```
monitoring/
├── prometheus.yml          # Prometheus configuration
└── grafana/
    ├── provisioning/       # Grafana provisioning configs
    │   ├── dashboards/
    │   └── datasources/
    └── dashboards/         # Custom Grafana dashboard JSON files
```

## 🚀 Usage

The monitoring stack is managed by the main `docker-compose.yml` file.

- **Start Services**:
  ```bash
  docker-compose up -d prometheus grafana
  ```

- **Access Services**:
  - **Prometheus**: `http://localhost:9090`
  - **Grafana**: `http://localhost:3001` (Default login: `admin`/`admin`)

## ⚙️ Configuration

### Prometheus

The `prometheus.yml` file defines:
- **Scrape Targets**: Services that Prometheus will monitor (e.g., the backend API).
- **Alerting Rules**: Conditions for firing alerts.
- **Global Settings**: Scraping interval, evaluation interval.

### Grafana

Grafana is provisioned automatically using the files in `grafana/provisioning`.
- **Datasources**: The Prometheus datasource is automatically configured.
- **Dashboards**: Any JSON dashboard models placed in `grafana/dashboards` will be automatically loaded into Grafana.

## 📈 Key Metrics Monitored

- **API Performance**: Request latency, rate, and errors (by endpoint).
- **Database Health**: Connection pool usage, query performance, replication lag.
- **System Resources**: CPU, memory, and disk usage for each service.
- **Business Metrics**: Number of pickup requests, payments processed, etc.
- **Queue Health**: Job queue length, wait times, failure rates.

## 🚨 Alerting

Alerts are defined in Prometheus and can be configured to send notifications via:
- Email
- Slack
- PagerDuty
- ...and more, via Alertmanager. 