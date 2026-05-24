module.exports = {
    // ─── SERVER ──────────────────────────────────────────────────────────────
    server_name: "Growtopia",
    // public ipv4
    server_ip: "127.0.0.1",
    // UDP port
    server_port: 55000,
    // login url dashboard
    loginurl: "growtopia-login-backend-omega-seven.vercel.app",
    // for new server header
    type2: true,
    // meta
    meta: "-",

    // YANG DI BAWAH INI JANGAN DI OTAK ATIK!!
    // ─── STORJ CDN ───────────────────────────────────────────────────────────
    // Enable Storj CDN auto-fetch
    // Kalau file tidak ada di local /public/cache/, otomatis fetch dari Storj
    storj_enabled: true,

    // Public share URL dari Storj bucket kamu
    // Cara dapet: Storj Dashboard → Buckets → Share → Public Link
    // Contoh: "https://link.storjshare.io/s/jvxxxxxxxxxxxxxx/nama-bucket"
    storj_cdn_url: "https://link.storjshare.io/s/jw5wixcetalbeq7ulzqxbtmqe4ha/gtps-cdn/cache/",

    // Simpan file yang di-fetch dari Storj ke local cache supaya
    // request berikutnya langsung dari disk (hemat bandwidth Storj)
    storj_cache_local: true,

    // Timeout fetch ke Storj (ms)
    storj_timeout: 15000,
};
