# Final Production Smoke Test Checklist

**Storefront (`easy.kaiofficial.xyz`):**

- [ ] Home page loads, stats cards show live data
- [ ] Product listing filters work
- [ ] Product detail images load from Cloudinary
- [ ] Guest checkout completes successfully → order appears in dashboard
- [ ] Customer registration and login work
- [ ] OAuth (Google) redirects and returns to app successfully

**Management Dashboard (`admin-easy.kaiofficial.xyz`):**

- [ ] Admin login works, `CUSTOMER` role rejected
- [ ] Category, Size, Style CRUD all functional
- [ ] Product create with images uploads to Cloudinary
- [ ] Order status update reflects immediately
- [ ] User management: create, deactivate, role change

**API (`api-easy.kaiofficial.xyz`):**

- [ ] `GET /api/health` returns `{ status: 'ok' }`
- [ ] `GET /api/docs` loads Swagger UI
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Unlisted CORS origin is rejected (check dev tools network tab)

**Infrastructure:**

- [ ] SSL certificate valid (check browser padlock)
- [ ] `certbot renew --dry-run` exits 0
- [ ] `docker ps` shows all 4 containers (`postgres`, `backend`, `customer`, `management`) as `Up`
