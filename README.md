# Webmail App - Enterprise Email Delivery Platform

A production-ready webmail application built with Next.js, featuring enterprise-grade email delivery with excellent inbox placement for Office 365, Gmail, and Yahoo.

## 🚀 Features

- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **📱 Mobile-First Design**: Fully responsive with touch-optimized interactions
- **Secure Authentication**: NextAuth.js with JWT and bcrypt password hashing
- **SMTP Integration**: Full SMTP support with DKIM signing for deliverability
- **Email Management**: Compose, send, and track email history
- **Enterprise Deliverability**: SPF, DKIM, DMARC, and TLS authentication
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Status**: Track email delivery status and message IDs

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- SMTP server or email service
- Domain with DNS access (for deliverability setup)

## 🛠️ Installation

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd webmail-app
npm install
```

2. **Environment Setup**
```bash
cp env-example .env
```

3. **Configure Environment Variables**
Edit `.env` with your settings:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/webmail"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# SMTP Configuration
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_smtp_password
EMAIL_FROM="Your App <noreply@yourdomain.com>"

# DKIM Configuration (optional but recommended)
DKIM_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END RSA PRIVATE KEY-----"
DKIM_SELECTOR=default
DKIM_DOMAIN=yourdomain.com
```

4. **Database Setup**
```bash
npx prisma generate
npx prisma db push
```

5. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📱 Mobile-Responsive Design

The webmail app is fully optimized for mobile devices and provides an excellent experience across all screen sizes:

### Mobile Features:
- **📱 Touch-Optimized Interface**: All buttons and controls sized for easy finger navigation
- **🔄 Responsive Layout**: Adapts seamlessly from mobile (375px) to desktop (1024px+)
- **📧 Mobile Email Management**: Email lists display as cards on mobile for better readability
- **⌨️ Mobile Forms**: Optimized inputs with proper mobile keyboard support
- **🗂️ Adaptive Navigation**: Header navigation stacks vertically on smaller screens

### Testing Mobile Experience:
1. **Browser Testing**: Use F12 → mobile device icon to test responsive design
2. **Device Testing**: Visit directly on your phone/tablet at `http://localhost:3000`
3. **Screen Compatibility**: Tested on iPhone (375px), Android (393px), and tablets (768px)

### Mobile-First Benefits:
- No horizontal scrolling required
- Text remains readable without zooming
- All interactive elements meet 44px touch target minimum
- Forms work seamlessly with mobile keyboards
- Fast loading optimized for mobile networks

## 📧 Email Deliverability Setup

To ensure your emails land in inboxes (not spam), configure these DNS records:

### 1. SPF Record
Add this TXT record to your domain DNS:
```
v=spf1 ip4:YOUR_SERVER_IP include:spf.yourdomain.com -all
```

### 2. DKIM Setup
Generate DKIM keys:
```bash
# Generate private key
openssl genrsa -out dkim_private.key 2048

# Generate public key
openssl rsa -in dkim_private.key -pubout -out dkim_public.key

# Format for DNS (remove headers and join lines)
cat dkim_public.key | grep -v "BEGIN\|END" | tr -d '\n'
```

Add TXT record: `default._domainkey.yourdomain.com`
```
v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_HERE
```

### 3. DMARC Policy
Add TXT record: `_dmarc.yourdomain.com`
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com; fo=1
```

### 4. Reverse DNS (PTR)
Ensure your server IP resolves to your mail domain:
```
YOUR_SERVER_IP → mail.yourdomain.com
```

### 5. MX Record (if receiving emails)
```
yourdomain.com. 10 mail.yourdomain.com.
```

## 🧪 Testing Email Deliverability

### Automated Testing
```bash
# Test SMTP connection
node -e "
const { smtpClient } = require('./lib/smtpClient');
smtpClient.verifyConnection().then(result => 
  console.log('SMTP Test:', result ? 'PASSED' : 'FAILED')
);
"
```

### Manual Testing
1. **Send Test Email**: Use the compose page to send to yourself
2. **Check Headers**: Verify SPF, DKIM, DMARC in received email
3. **Spam Testing**: Use [Mail Tester](https://www.mail-tester.com) for 10/10 score
4. **Delivery Testing**: Test with Office 365, Gmail, Yahoo accounts

### Expected Results
- ✅ SPF: PASS
- ✅ DKIM: PASS  
- ✅ DMARC: PASS
- ✅ TLS: Encrypted
- ✅ Score: 10/10

## 🔧 SMTP Server Setup (Ubuntu/VPS)

### Install and Configure Postfix
```bash
# Install Postfix
sudo apt update
sudo apt install postfix postfix-doc

# Configure main.cf
sudo nano /etc/postfix/main.cf
```

Add these configurations:
```
# Basic Configuration
myhostname = mail.yourdomain.com
mydomain = yourdomain.com
myorigin = $mydomain
inet_interfaces = all
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain

# TLS Configuration
smtp_tls_security_level = may
smtp_tls_note_starttls_offer = yes
smtp_tls_protocols = !SSLv2, !SSLv3
smtp_tls_ciphers = high
smtp_tls_exclude_ciphers = aNULL, MD5

# DKIM (with OpenDKIM)
milter_protocol = 2
milter_default_action = accept
smtpd_milters = inet:localhost:8891
non_smtpd_milters = inet:localhost:8891

# Authentication
smtpd_sasl_auth_enable = yes
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
```

### Install OpenDKIM
```bash
sudo apt install opendkim opendkim-tools

# Configure DKIM
sudo nano /etc/opendkim.conf
```

### SSL Certificate
```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d mail.yourdomain.com
```

## 🚀 Production Deployment

### Option 1: Vercel + External SMTP
```bash
# Deploy to Vercel
npm run build
npx vercel

# Configure environment variables in Vercel dashboard
```

### Option 2: VPS Deployment
```bash
# Build application
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "webmail-app" -- start

# Configure nginx reverse proxy
sudo nano /etc/nginx/sites-available/webmail
```

Nginx configuration:
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Database Options
1. **Supabase**: Managed PostgreSQL
2. **Neon**: Serverless PostgreSQL  
3. **DigitalOcean**: Managed Database
4. **Self-hosted**: PostgreSQL on VPS

## 🛡️ Security Best Practices

1. **Environment Variables**: Never commit sensitive data
2. **Database**: Use connection pooling and SSL
3. **SMTP**: Always use TLS/STARTTLS
4. **Authentication**: Strong JWT secrets
5. **Rate Limiting**: Implement email sending limits
6. **Monitoring**: Log all email activities

## 📊 Monitoring & Analytics

### Email Tracking
- Delivery status monitoring
- Bounce handling
- SMTP error logging
- Message ID tracking

### Dashboard Features
- Sent email history
- Delivery statistics  
- Error reporting
- User activity logs

## 🔍 Troubleshooting

### Common Issues

**SMTP Connection Failed**
```bash
# Test SMTP manually
telnet your-smtp-server.com 587
```

**Emails Going to Spam**
1. Check SPF/DKIM/DMARC setup
2. Verify server IP reputation
3. Use mail-tester.com for diagnostics
4. Warm up IP gradually

**DKIM Signature Failed**
1. Verify private key format in .env
2. Check DNS TXT record
3. Ensure selector matches

**Database Connection Issues**
```bash
# Test database connection
npx prisma db push --preview-feature
```

### Debug Commands
```bash
# Check DNS records
dig TXT yourdomain.com
dig TXT default._domainkey.yourdomain.com
dig TXT _dmarc.yourdomain.com

# Test SMTP authentication
swaks --to test@gmail.com --from your@domain.com --server smtp.yourdomain.com:587 --auth-user your@domain.com --auth-password yourpass
```

## 📈 Performance Optimization

1. **Connection Pooling**: Configure Prisma connection limits
2. **Caching**: Implement Redis for session storage
3. **CDN**: Use Vercel Edge Network or CloudFlare
4. **Database**: Optimize queries and add indexes
5. **SMTP**: Use connection pooling for high volume

## 🔄 Maintenance

### Regular Tasks
- Monitor email delivery rates
- Update DNS records if IP changes
- Rotate DKIM keys annually
- Update dependencies monthly
- Backup database weekly

### Scaling Considerations
- Implement email queuing (Bull/Agenda)
- Add multiple SMTP providers
- Set up read replicas for database
- Monitor and alert on failures

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review logs in `/var/log/mail.log`
3. Test with mail-tester.com
4. Verify DNS propagation

## 📄 License

MIT License - see LICENSE file for details.

---

**Note**: This application is designed for legitimate email communication. Ensure compliance with anti-spam laws and email marketing regulations in your jurisdiction. 