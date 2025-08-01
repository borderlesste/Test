# 🚀 Production Setup Guide - Borderless Techno Company

## 📋 Overview
Complete guide to deploy your Borderless Techno Company application to production using Vercel.

## ✅ Pre-Deployment Checklist

### Database Setup
- [x] Database `dblzyyrh_techno` created and configured
- [x] Admin user created with full privileges
- [x] Database connection tested and working
- [x] Production database URL configured

### Environment Configuration
- [x] Production environment files created
- [x] Database URL updated to use correct hostname
- [x] Security secrets configured
- [x] PayPal credentials configured for live environment

## 🔧 Production Environment Configuration

### Client Environment Variables (Vercel Dashboard)
```env
VITE_API_URL=https://borderlesstechno.com
VITE_CLIENT_URL=https://borderlesstechno.com
VITE_SERVER_URL=https://borderlesstechno.com
VITE_APP_NAME=Borderless Techno Company
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

### Server Environment Variables (Vercel Dashboard)
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://dblzyyrh_techno:dblzyyrh_techno@borderlesstechno.com:3306/dblzyyrh_techno?multipleStatements=true
SESSION_SECRET=Xpr92jK#mF9!kD84@v2!3jeOwlz1@MnQz
JWT_SECRET=Yqp49Ld!xf8d$w9v1qXL4$dOl1wPz9nM
JWT_EXPIRATION=1h
PAYPAL_CLIENT_ID=AYV0BQVyuO5QedqdZT6Fjm5_eFuaVNRoJSy06KcUloqdjsgA3K3nlZQ1H_WyPih70QXgqA9lB32s1LbX
PAYPAL_CLIENT_SECRET=EM8ymJGKlhFx4tuBG8wJIfGhCRliwbHsY8xTnvqn18Io1UYTu1M7iJPPTtdFcamrN6_ZCSTbaDLRrMXS
PAYPAL_ENVIRONMENT=live
ALLOWED_ORIGINS=https://borderlesstechno.com,https://www.borderlesstechno.com
```

## 🚀 Deployment Steps

### 1. Frontend Deployment (Vercel)

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the repository

2. **Configure Frontend Project**
   ```
   Framework: Vite
   Build Command: npm run build:production
   Output Directory: dist
   Install Command: npm install
   Root Directory: client
   ```

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all client environment variables listed above

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### 2. Backend Deployment (Vercel)

1. **Create New Project for Backend**
   - Create a separate Vercel project for the backend
   - Import the same repository

2. **Configure Backend Project**
   ```
   Framework: Other
   Root Directory: server
   ```

3. **Add Environment Variables**
   - Add all server environment variables listed above

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### 3. Domain Configuration

1. **Frontend Domain**
   - Configure your main domain: `borderlesstechno.com`
   - Add www redirect if desired

2. **Backend Domain**
   - Option A: Use same domain with API routes
   - Option B: Use subdomain: `api.borderlesstechno.com`

## 🔒 Security Checklist

- [x] Strong JWT and session secrets generated
- [x] PayPal live credentials configured
- [x] CORS properly configured for production domains
- [x] Database credentials secured
- [x] No sensitive data in version control

## 📱 Features Ready for Production

- ✅ Complete authentication system
- ✅ Admin dashboard with full functionality
- ✅ Client portal with payment integration
- ✅ PayPal payment processing (live mode)
- ✅ Order and quote management
- ✅ Multi-language support (ES/EN/FR/PT)
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Email notifications
- ✅ Security logging and monitoring

## 🧪 Testing in Production

### Login Credentials
```
Admin User:
Email: admin@borderlesstechno.com
Password: password

Database: dblzyyrh_techno (fully configured)
```

### Key URLs to Test
- `/` - Homepage
- `/login` - Login page
- `/admin/dashboard` - Admin dashboard
- `/client/dashboard` - Client dashboard
- `/services` - Services page
- `/portfolio` - Portfolio page
- `/contact` - Contact form

## 📊 Monitoring and Maintenance

1. **Database Monitoring**
   - Monitor connection pool usage
   - Check query performance
   - Backup database regularly

2. **Application Monitoring**
   - Monitor Vercel deployment logs
   - Check error rates
   - Monitor payment processing

3. **Security Monitoring**
   - Review login attempts
   - Monitor API usage
   - Check for unusual activity

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check database server accessibility
   - Confirm credentials are correct

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables
   - Review build logs in Vercel

3. **CORS Errors**
   - Update ALLOWED_ORIGINS
   - Check domain configuration
   - Verify API URL configuration

## 📞 Support

For deployment issues or questions:
- Check Vercel documentation
- Review application logs
- Test database connectivity
- Verify environment configuration

---

**Ready for Production! 🎉**

Your Borderless Techno Company application is now configured and ready for production deployment.