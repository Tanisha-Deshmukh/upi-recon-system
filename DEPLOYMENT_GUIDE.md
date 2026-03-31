# 🚀 PaySync Deployment Guide - Render

## 📋 Prerequisites
- GitHub repository with your PaySync code
- Render account (free tier available)
- MongoDB Atlas account (or use Render's MongoDB)

## 🗂️ Repository Structure
```
UPI-RECON-SYSYTEM/
├── render.yaml                    # Main deployment config
├── upi-recon-system/
│   ├── mock-bank-api/
│   ├── upiPaymentSystem/
│   ├── upi-reconciliation/
│   └── react-app/
└── DEPLOYMENT_GUIDE.md
```

## 🚀 Step-by-Step Deployment

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. **Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Verify your email

### 3. **Deploy Using Blueprint**
1. On Render dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Select the `UPI-RECON-SYSYTEM` repository
4. Render will auto-detect your `render.yaml`
5. Click **"Apply"**

### 4. **Services Created**
Render will create 4 services:
- **mock-bank-api** (Web Service)
- **upi-payment-system** (Web Service) 
- **reconciliation-engine** (Background Worker)
- **paysync-frontend** (Static Site)
- **paysync-mongodb** (Database)

## ⚙️ Environment Variables

### Automatically Generated:
- `MONGODB_URI` - Database connection
- `PUBLIC_VAPID_KEY` / `PRIVATE_VAPID_KEY` - Push notifications
- `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` - JWT tokens

### Manual Updates Needed:
1. **VAPID Email**: Update in reconciliation service
2. **CORS Origins**: Update if using custom domains

## 🔧 Post-Deployment Setup

### 1. **Database Seeding**
After deployment, seed the mock bank:
```bash
# Access your service logs on Render dashboard
# Run this in the mock-bank-api service console:
node src/seed.js
```

### 2. **Frontend URL**
Your app will be available at:
`https://paysync-frontend.onrender.com`

### 3. **API Endpoints**
- UPI API: `https://upi-payment-system.onrender.com/api/v1`
- Reconciliation API: `https://reconciliation-engine.onrender.com/api/v1`
- Mock Bank API: `https://mock-bank-api.onrender.com/api/v1`

## 🔍 Monitoring

### Check Service Logs:
1. Go to Render dashboard
2. Click on each service
3. View **Logs** tab for debugging

### Health Checks:
- Frontend should load without errors
- All API services should respond to health checks
- Reconciliation worker should show cron job logs

## 🐛 Common Issues

### 1. **Database Connection**
- Ensure MongoDB is running
- Check connection string in environment variables

### 2. **CORS Issues**
- Verify CORS_ORIGIN matches your frontend URL
- Check all services have correct CORS settings

### 3. **Push Notifications**
- Ensure VAPID keys are properly set
- Check browser permissions (not incognito mode)

### 4. **Service Communication**
- Verify all services can reach each other
- Check network logs for connection errors

## 🔄 Updates

### To Update Your App:
1. Push changes to GitHub
2. Render will auto-deploy
3. Monitor deployment logs

### Manual Redeploy:
1. Go to service on Render dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

## 📞 Support

- Render docs: [render.com/docs](https://render.com/docs)
- MongoDB Atlas: [cloud.mongodb.com](https://cloud.mongodb.com)
- Your deployed app: Check Render dashboard for URLs

## 🎉 Success!

Once deployed, your PaySync UPI Reconciliation System will be:
- ✅ Live on the internet
- ✅ Accessible 24/7
- ✅ Processing real-time payments
- ✅ Running automated reconciliation
- ✅ Sending push notifications

Test the full flow:
1. Register users
2. Link bank accounts
3. Send payments
4. Verify reconciliation notifications
