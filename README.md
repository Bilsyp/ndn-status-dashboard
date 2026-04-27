# NDN Status Dashboard

Frontend dashboard to monitor NDN forwarder status via REST API.

## 🚀 Features

- View routing table (`/routes`)
- Monitor Content Store stats (`/cs`)
- Search & filter prefix
- Auto-refresh data (real-time feel)

## 🖥️ Preview

Displays:

- Prefix routes
- Nexthop info
- Cache metrics (hits, misses, entries)

## ⚙️ Setup

```bash
git clone https://github.com/Bilsyp/ndn-status-dashboard.git
cd ndn-status-dashboard
npm install
npm run dev
```

## 🔌 API Connection

Make sure backend API is running:

👉 https://github.com/Bilsyp/ndn-status-api

Default API endpoint:

```bash
http://localhost:5555/api
```

If using proxy (recommended):

```json
"proxy": "http://localhost:3000"
```

## 📡 Endpoints Used

- `/api/routes`
- `/api/cs`

## 🛠️ Tech Stack

- React
- Fetch API
- TailwindCSS (optional styling)

## 🛡️ Notes

- This dashboard depends on backend API
- Ensure NFD is running on the server

## 📌 Future Improvements

- Charts (hits vs misses)
- Multi-node monitoring
- WebSocket real-time updates
- Authentication support

## 👤 Author

Built for NDN monitoring & experimentation
