// 🌱 우리 가족 정원 - Service Worker
// 버전을 바꾸면 자동으로 새 캐시로 교체됩니다
const CACHE_VERSION = 'garden-v5';

// 설치: 새 캐시 생성
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 대기 없이 즉시 활성화
});

// 활성화: 이전 버전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // 즉시 모든 탭에 적용
  );
});

// 요청 처리: Network First 전략
// 항상 서버에서 최신 파일을 가져오고, 오프라인일 때만 캐시 사용
self.addEventListener('fetch', (event) => {
  // Supabase API 요청은 캐시하지 않음
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 성공하면 캐시에 저장하고 반환
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // 오프라인이면 캐시에서 반환
        return caches.match(event.request);
      })
  );
});
