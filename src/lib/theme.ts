// Theme sáng/tối. Lựa chọn của người dùng nằm ở localStorage; chưa chọn thì theo hệ thống.
export const THEME_STORAGE_KEY = 'kite-theme'

// Chạy đồng bộ trong <head>, TRƯỚC khi trang paint — nếu để tới lúc React hydrate thì
// người dùng chọn nền tối sẽ thấy một nháy trắng mỗi lần tải trang.
// Bọc try/catch vì localStorage có thể bị chặn; hỏng thì rơi về nền sáng, không làm vỡ trang.
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`
