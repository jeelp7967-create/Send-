// SENND — Page 1 (Home) & Page 2 (Scan) Core Engine

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // AUTOMATIC DARK / LIGHT MODE DETECTION & LIVE SYNC
  // =========================================================================
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function handleThemeChange(e) {
    if (e.matches) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }
  darkModeMediaQuery.addEventListener('change', handleThemeChange);
  handleThemeChange(darkModeMediaQuery);
  // =========================================================================
  // DATA STORE (PERSISTENT & SEED DATA)
  // =========================================================================
  const INITIAL_POSTS = [
    {
      id: 'sennd-post-1',
      title: 'Premium Wireless Studio Headphones',
      category: 'Product',
      author: 'Acoustic Labs',
      username: '@acoustic_lab',
      avatarBg: '#ff8c42',
      likesCount: 142,
      description: 'Explore studio wireless audio with rich acoustic drivers and active noise cancellation.',
      qrDestination: 'https://example.com/products/orange-headphones',
      location: 'Ahmedabad, Gujarat',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      price: '$149.00',
      details: 'Scan the sticker QR on packaging to verify authenticity and claim extended 2-year warranty.'
    },
    {
      id: 'sennd-post-2',
      title: 'Kutch White Salt Desert Safari',
      category: 'Place',
      author: 'Wanderlust India',
      username: '@wander_kutch',
      avatarBg: '#6c5ce7',
      likesCount: 238,
      description: 'White salt desert safari, heritage stay, and local artisan village tours in western India.',
      qrDestination: 'https://example.com/places/kutch-desert-safari',
      location: 'Gujarat, India',
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
      details: 'Physical QR stickers placed at Desert Camp guide centers reveal audio trails and offline maps.'
    },
    {
      id: 'sennd-post-3',
      title: 'Minimal Oak Ergonomic Desk',
      category: 'Product',
      author: 'Nordic Craft',
      username: '@nordic_work',
      avatarBg: '#171717',
      likesCount: 96,
      description: 'A clean ergonomic workspace with built-in magnetic cable routing and wireless charging pad.',
      qrDestination: 'https://example.com/workspace/oak-desk',
      location: 'Surat, Gujarat',
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',
      price: '$389.00',
      details: 'Scan the timber desk QR code to download CAD diagrams and 3D augmented-reality room preview.'
    },
    {
      id: 'sennd-post-4',
      title: 'Mumbai Kinetic Motion Reel',
      category: 'Video',
      author: 'Cinema Craft',
      username: '@mumbai_motion',
      avatarBg: '#ff8c42',
      likesCount: 312,
      description: 'Fast-paced kinetic cinematography and street motion design captured across Mumbai.',
      qrDestination: 'https://example.com/videos/mumbai-motion-reel',
      location: 'Mumbai, India',
      image: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=800&q=80',
      details: 'Exclusive behind-the-scenes 4K cut and color grading presets available through this QR portal.'
    },
    {
      id: 'sennd-post-5',
      title: 'Artisan Micro-Lot Pour-Over Coffee',
      category: 'Product',
      author: 'Roast Masters',
      username: '@roast_blr',
      avatarBg: '#8b5cf6',
      likesCount: 184,
      description: 'Single origin medium-dark roast beans sourced from organic high-altitude hill estates.',
      qrDestination: 'https://example.com/products/artisan-coffee',
      location: 'Bengaluru, India',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      price: '$24.00',
      details: 'Scan the sticker on the pouch for barista brew temperature recommendations and farm origin notes.'
    },
    {
      id: 'sennd-post-6',
      title: 'Electro-Acoustic Seaside EP',
      category: 'Audio',
      author: 'Goa Sound Collective',
      username: '@goa_waves',
      avatarBg: '#10b981',
      likesCount: 157,
      description: 'Warm analog synthesizer harmonies blended with field recordings from the Arabian Sea coastline.',
      qrDestination: 'https://example.com/audio/seaside-ep',
      location: 'Goa Coast, India',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      price: '$12.00',
      details: 'Scan the vinyl sleeve sticker for 24-bit lossless FLAC download and interactive lyric sheet.'
    }
  ];

  // Load posts from localStorage or initialize with seed
  let posts = JSON.parse(localStorage.getItem('sennd_posts') || 'null');
  if (!posts || !Array.isArray(posts) || posts.length === 0 || !posts[0].author) {
    posts = INITIAL_POSTS;
    localStorage.setItem('sennd_posts', JSON.stringify(posts));
  }

  // Saved post IDs & Liked post IDs
  let savedIds = JSON.parse(localStorage.getItem('sennd_saved_posts') || '["sennd-post-1", "sennd-post-2"]');
  let likedIds = JSON.parse(localStorage.getItem('sennd_liked_posts') || '["sennd-post-1"]');

  // Filter States
  let currentCategory = 'All';
  let searchQuery = '';
  let locationFilter = '';
  let showOnlySaved = false;

  // Active View State ('homeView' or 'scanView')
  let currentView = 'homeView';

  // Global State Variables (Hoisted to top of scope to prevent TDZ ReferenceErrors)
  let activeModalPost = null;
  let cameraStream = null;
  let currentTrack = null;
  let flashOn = false;
  let animationFrameId = null;
  let isScanningActive = false;
  let statusTimeout = null;
  let latestScannedCode = '';
  let pendingPostImageUrl = '';

  // =========================================================================
  // VIEW NAVIGATION (SWITCH BETWEEN HOME PAGE AND SCAN PAGE)
  // =========================================================================
  const homeView = document.getElementById('homeView');
  const scanView = document.getElementById('scanView');
  const navItems = document.querySelectorAll('.nav-item');
  const headerScan = document.getElementById('headerScan');
  const backBtn = document.getElementById('backBtn');
  const brandLogoHome = document.getElementById('brandLogoHome');

  function switchToView(viewId, activeNavId = 'navHome') {
    if (currentView === 'scanView' && viewId !== 'scanView') {
      // STOP CAMERA CLEANLY WHEN LEAVING SCAN PAGE
      stopCamera();
    }

    currentView = viewId;

    if (viewId === 'homeView') {
      if (homeView) homeView.classList.add('active');
      if (scanView) scanView.classList.remove('active');
      if (headerScan) headerScan.classList.remove('active');
      updateNavHighlight(activeNavId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewId === 'scanView') {
      if (scanView) scanView.classList.add('active');
      if (homeView) homeView.classList.remove('active');
      if (headerScan) headerScan.classList.add('active');
      updateNavHighlight('navScan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function updateNavHighlight(activeId) {
    navItems.forEach(item => {
      if (item.id === activeId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Header Scan Button (On Home Page) -> opens Scan Page
  if (headerScan) {
    headerScan.addEventListener('click', () => {
      switchToView('scanView');
    });
  }

  // Back Button (On Scan Page) -> returns to Home Page & stops camera
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      stopCamera();
      switchToView('homeView');
    });
  }

  // Home Brand Logo -> returns to Home Page
  if (brandLogoHome) {
    brandLogoHome.addEventListener('click', () => {
      showOnlySaved = false;
      currentCategory = 'All';
      searchQuery = '';
      locationFilter = '';
      updateCategoryFilterButtons();
      renderPosts();
      switchToView('homeView');
    });
  }

  // Bottom Navigation Bar
  const navHome = document.getElementById('navHome');
  if (navHome) {
    navHome.addEventListener('click', () => {
      stopCamera();
      showOnlySaved = false;
      currentCategory = 'All';
      updateCategoryFilterButtons();
      renderPosts();
      switchToView('homeView');
    });
  }

  const navScan = document.getElementById('navScan');
  if (navScan) {
    navScan.addEventListener('click', () => {
      switchToView('scanView');
    });
  }

  const navProducts = document.getElementById('navProducts');
  if (navProducts) {
    navProducts.addEventListener('click', () => {
      showOnlySaved = false;
      currentCategory = 'Product';
      updateCategoryFilterButtons();
      renderPosts();
      switchToView('homeView', 'navProducts');
    });
  }

  const navSaved = document.getElementById('navSaved');
  if (navSaved) {
    navSaved.addEventListener('click', () => {
      showOnlySaved = true;
      currentCategory = 'All';
      updateCategoryFilterButtons();
      renderPosts();
      switchToView('homeView', 'navSaved');
    });
  }

  // =========================================================================
  // PAGE 1: HOME PAGE IMPLEMENTATION
  // =========================================================================
  const postsContainer = document.getElementById('postsContainer');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const showAllBtn = document.getElementById('showAllBtn');
  const locationBanner = document.getElementById('locationBanner');
  const currentLocDisplay = document.getElementById('currentLocDisplay');
  const resetLocationBtn = document.getElementById('resetLocationBtn');

  // Tool Buttons (3 Square Buttons in One Row: Product, Location, QR Search)
  const toolProduct = document.getElementById('toolProduct');
  const toolLocation = document.getElementById('toolLocation');
  const toolQrSearch = document.getElementById('toolQrSearch');

  // Tool 1: Product
  if (toolProduct) {
    toolProduct.addEventListener('click', () => {
      toolProduct.classList.toggle('selected');
      if (toolProduct.classList.contains('selected')) {
        currentCategory = 'Product';
      } else {
        currentCategory = 'All';
      }
      updateCategoryFilterButtons();
      renderPosts();
    });
  }

  // Tool 3: Location (Request GPS or enter location)
  if (toolLocation) {
    toolLocation.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser. Please type your city in the search bar.');
        return;
      }

      toolLocation.classList.add('selected');

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          let resolvedCity = 'Nearby';

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            if (res.ok) {
              const data = await res.json();
              resolvedCity = data.address?.city || data.address?.town || data.address?.state || 'Nearby';
            }
          } catch {}

          locationFilter = resolvedCity;
          if (currentLocDisplay) currentLocDisplay.textContent = resolvedCity;
          if (locationBanner) locationBanner.style.display = 'flex';
          renderPosts();
        },
        (err) => {
          if (toolLocation) toolLocation.classList.remove('selected');
          if (err.code === err.PERMISSION_DENIED) {
            alert('Location permission was denied. You can filter posts by category.');
          } else {
            alert('Could not determine current location.');
          }
        },
        { timeout: 8000 }
      );
    });
  }

  if (resetLocationBtn) {
    resetLocationBtn.addEventListener('click', () => {
      locationFilter = '';
      if (locationBanner) locationBanner.style.display = 'none';
      if (toolLocation) toolLocation.classList.remove('selected');
      renderPosts();
    });
  }

  // Tool 4: QR Code Search -> switches to Scan Page
  if (toolQrSearch) {
    toolQrSearch.addEventListener('click', () => {
      switchToView('scanView');
    });
  }



  // Category filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.filter;
      showOnlySaved = false;
      updateCategoryFilterButtons();
      renderPosts();
    });
  });

  function updateCategoryFilterButtons() {
    filterButtons.forEach(btn => {
      if (btn.dataset.filter === currentCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (toolProduct) {
      if (currentCategory === 'Product') {
        toolProduct.classList.add('selected');
      } else {
        toolProduct.classList.remove('selected');
      }
    }
  }

  if (showAllBtn) {
    showAllBtn.addEventListener('click', () => {
      currentCategory = 'All';
      showOnlySaved = false;
      searchQuery = '';
      locationFilter = '';
      if (locationBanner) locationBanner.style.display = 'none';
      if (toolProduct) toolProduct.classList.remove('selected');
      if (toolLocation) toolLocation.classList.remove('selected');
      updateCategoryFilterButtons();
      renderPosts();
    });
  }

  // Render Modern Social QR Discovery Cards
  function renderPosts() {
    postsContainer.innerHTML = '';

    const filtered = posts.filter(post => {
      // Saved filter
      if (showOnlySaved && !savedIds.includes(post.id)) {
        return false;
      }

      // Category filter
      if (currentCategory !== 'All' && post.category.toLowerCase() !== currentCategory.toLowerCase()) {
        return false;
      }

      // Location filter
      if (locationFilter && (!post.location || !post.location.toLowerCase().includes(locationFilter.toLowerCase()))) {
        return false;
      }

      // Text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchDesc = post.description.toLowerCase().includes(q);
        const matchCat = post.category.toLowerCase().includes(q);
        const matchLoc = post.location && post.location.toLowerCase().includes(q);
        const matchQR = post.qrDestination && post.qrDestination.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchLoc && !matchQR) {
          return false;
        }
      }

      return true;
    });

    if (filtered.length === 0) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-filter"></i>
          <h3>No matching posts found</h3>
          <p>Try resetting your filter or picking another category.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(post => {
      const isSaved = savedIds.includes(post.id);
      const isLiked = likedIds.includes(post.id);
      const likesCount = (post.likesCount || 100) + (isLiked ? 1 : 0);

      const card = document.createElement('article');
      card.className = 'post-card';
      card.dataset.id = post.id;

      card.innerHTML = `
        <!-- 1. AUTHOR & CATEGORY HEADER -->
        <div class="post-header-row">
          <div class="post-author-wrap">
            <div class="post-avatar" style="background: ${post.avatarBg || '#171717'}">
              ${(post.author || post.category || 'S')[0].toUpperCase()}
            </div>
            <div class="post-author-text">
              <div class="post-author-name">
                <span>${post.author || 'SENND Creator'}</span>
                <span class="post-verified-badge" title="Verified Creator"><i class="fa-solid fa-circle-check"></i></span>
              </div>
              <div class="post-sub-line">
                <span class="post-handle">${post.username || '@sennd'}</span>
                ${post.location ? `<span class="meta-dot">·</span><span class="post-location-tag"><i class="fa-solid fa-location-dot"></i>${post.location}</span>` : ''}
              </div>
            </div>
          </div>
          <span class="post-category-chip">${post.category}</span>
        </div>

        <!-- 2. HIGH-QUALITY MEDIA COVER -->
        <div class="post-media-container" title="Click to view details">
          <img class="post-media-img" src="${post.image}" alt="${post.title}" loading="lazy">
          ${post.price ? `<span class="post-floating-price">${post.price}</span>` : ''}
        </div>

        <!-- 3. TITLE & DESCRIPTION -->
        <div class="post-content-body">
          <h3 class="post-card-title">${post.title}</h3>
          <p class="post-card-desc">${post.description}</p>
        </div>

        <!-- 4. PHYSICAL QR STICKER & DESTINATION COMPARTMENT -->
        <div class="post-qr-compartment">
          <div class="qr-sticker-box" id="qr-${post.id}" title="Tap QR sticker to enlarge & download">
            <!-- QR code rendered here -->
            <span class="qr-mini-badge">SCAN</span>
          </div>

          <div class="qr-destination-info">
            <div class="qr-label-kicker"><i class="fa-solid fa-qrcode"></i> VERIFIED QR STICKER</div>
            <div class="qr-dest-url" title="${post.qrDestination}">${post.qrDestination.replace(/^https?:\/\//, '')}</div>
            <div class="qr-hint-text">Tap code to view & print QR sticker</div>
          </div>

          <button class="qr-quick-visit-btn" data-url="${post.qrDestination}" title="Open destination URL">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span>Visit</span>
          </button>
        </div>

        <!-- 5. SOCIAL ENGAGEMENT ACTION BAR -->
        <div class="post-engagement-bar">
          <div class="engagement-left">
            <button class="engagement-btn like-btn ${isLiked ? 'liked' : ''}" aria-label="Like Post">
              <i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
              <span class="like-counter">${likesCount}</span>
            </button>
            <button class="engagement-btn save-btn ${isSaved ? 'saved' : ''}" aria-label="Save Post">
              <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
              <span>Save</span>
            </button>
            <button class="engagement-btn share-btn" aria-label="Share Post">
              <i class="fa-solid fa-share-nodes"></i>
              <span>Share</span>
            </button>
          </div>

          <button class="engagement-btn details-link-btn" aria-label="View Details">
            <span>Details</span>
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      `;

      // 1. Click media or title -> open detail modal
      card.querySelector('.post-media-container').addEventListener('click', () => {
        openDetailModal(post);
      });
      card.querySelector('.post-card-title').addEventListener('click', () => {
        openDetailModal(post);
      });

      // 2. Details link button -> open details
      card.querySelector('.details-link-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openDetailModal(post);
      });

      // 3. Like button -> toggle like
      const likeBtn = card.querySelector('.like-btn');
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLikePost(post.id, likeBtn, post.likesCount || 100);
      });

      // 4. Save button -> toggle save
      const saveBtn = card.querySelector('.save-btn');
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSavePost(post.id, saveBtn);
      });

      // 5. Share button -> share link
      card.querySelector('.share-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        sharePost(post);
      });

      // 6. QR sticker box -> open enlarged QR sticker modal
      const qrBox = card.querySelector('.qr-sticker-box');
      qrBox.addEventListener('click', (e) => {
        e.stopPropagation();
        openQrModal(post);
      });

      // 7. Quick Visit button -> open destination link
      const quickVisitBtn = card.querySelector('.qr-quick-visit-btn');
      quickVisitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(post.qrDestination, '_blank', 'noopener,noreferrer');
      });

      postsContainer.appendChild(card);

      // Render crisp QR code using QRCode library
      if (typeof QRCode !== 'undefined') {
        new QRCode(qrBox, {
          text: post.qrDestination,
          width: 58,
          height: 58,
          colorDark: '#171717',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    });
  }

  // Toggle Like Post
  function toggleLikePost(postId, btnElement, baseCount) {
    const idx = likedIds.indexOf(postId);
    const counter = btnElement.querySelector('.like-counter');
    const icon = btnElement.querySelector('i');

    if (idx > -1) {
      likedIds.splice(idx, 1);
      btnElement.classList.remove('liked');
      icon.className = 'fa-regular fa-heart';
      if (counter) counter.textContent = baseCount;
    } else {
      likedIds.push(postId);
      btnElement.classList.add('liked');
      icon.className = 'fa-solid fa-heart';
      if (counter) counter.textContent = baseCount + 1;
    }
    localStorage.setItem('sennd_liked_posts', JSON.stringify(likedIds));
  }

  // Toggle Save Post
  function toggleSavePost(postId, btnElement) {
    const idx = savedIds.indexOf(postId);
    const icon = btnElement.querySelector('i');
    if (idx > -1) {
      savedIds.splice(idx, 1);
      btnElement.classList.remove('saved');
      if (icon) icon.className = 'fa-regular fa-bookmark';
    } else {
      savedIds.push(postId);
      btnElement.classList.add('saved');
      if (icon) icon.className = 'fa-solid fa-bookmark';
    }
    localStorage.setItem('sennd_saved_posts', JSON.stringify(savedIds));

    if (showOnlySaved) {
      renderPosts();
    }
  }

  // Share Post
  async function sharePost(post) {
    const shareUrl = post.qrDestination;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SENND: ${post.title}`,
          text: post.description,
          url: shareUrl
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Destination link copied to clipboard!');
    } catch {
      alert(`Link: ${shareUrl}`);
    }
  }

  // Initial Post Render on Load
  renderPosts();

  // =========================================================================
  // PAGE 2: SCAN PAGE IMPLEMENTATION
  // =========================================================================
  const camera = document.getElementById('camera');
  const scannerContainer = document.getElementById('scannerContainer');
  const cameraPlaceholder = document.getElementById('cameraPlaceholder');
  const startCameraBtn = document.getElementById('startCamera');
  const stopCameraBtn = document.getElementById('stopCameraBtn');
  const qrCanvas = document.getElementById('qrCanvas');
  const statusMessage = document.getElementById('statusMessage');

  const flashBtn = document.getElementById('flashBtn');
  const locationBtn = document.getElementById('locationBtn');

  // Explore Inputs
  const uploadImageBtn = document.getElementById('uploadImage');
  const uploadPostBtn = document.getElementById('uploadPost');
  const productBtn = document.getElementById('productBtn');
  const imageInput = document.getElementById('imageInput');
  const postInput = document.getElementById('postInput');

  // Search Inputs
  const searchBtn = document.getElementById('searchBtn');
  const imageSearchBtn = document.getElementById('imageSearchBtn');
  const voiceBtn = document.getElementById('voiceBtn');
  const searchInputBox = document.getElementById('searchInputBox');
  const scannerSearchInput = document.getElementById('scannerSearchInput');
  const closeSearch = document.getElementById('closeSearch');

  // Scanner Modals
  const resultModal = document.getElementById('resultModal');
  const closeResultModal = document.getElementById('closeResultModal');
  const scannedPayload = document.getElementById('scannedPayload');
  const copyResultBtn = document.getElementById('copyResultBtn');
  const openLinkBtn = document.getElementById('openLinkBtn');
  const scanAgainBtn = document.getElementById('scanAgainBtn');

  const imagePreviewModal = document.getElementById('imagePreviewModal');
  const closeImageModal = document.getElementById('closeImageModal');
  const previewImg = document.getElementById('previewImg');
  const imageQrResultBox = document.getElementById('imageQrResultBox');
  const imageQrPayload = document.getElementById('imageQrPayload');
  const imageOpenLinkBtn = document.getElementById('imageOpenLinkBtn');

  const postModal = document.getElementById('postModal');
  const closePostModal = document.getElementById('closePostModal');
  const postPreviewImg = document.getElementById('postPreviewImg');
  const postPreviewWrap = document.getElementById('postPreviewWrap');
  const newPostTitle = document.getElementById('newPostTitle');
  const newPostCategory = document.getElementById('newPostCategory');
  const newPostDesc = document.getElementById('newPostDesc');
  const newPostLoc = document.getElementById('newPostLoc');
  const newPostUrl = document.getElementById('newPostUrl');
  const publishPostBtn = document.getElementById('publishPostBtn');

  const productModal = document.getElementById('productModal');
  const closeProductModal = document.getElementById('closeProductModal');

  // Scanner Camera Stream State (Declared at top of scope)
  cameraStream = null;
  currentTrack = null;
  flashOn = false;
  animationFrameId = null;
  isScanningActive = false;
  statusTimeout = null;
  latestScannedCode = '';

  const canvasCtx = qrCanvas.getContext('2d', { willReadFrequently: true });

  // Status helper
  function showStatus(msg, type = 'info', duration = 4000) {
    if (statusTimeout) clearTimeout(statusTimeout);
    statusMessage.textContent = msg;
    statusMessage.className = 'show';
    if (type === 'error') statusMessage.classList.add('error');
    if (type === 'success') statusMessage.classList.add('success');

    if (duration > 0) {
      statusTimeout = setTimeout(() => {
        statusMessage.className = '';
        statusMessage.textContent = '';
      }, duration);
    }
  }

  // Camera start
  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showStatus('Camera requires HTTPS or localhost.', 'error');
      return;
    }

    try {
      showStatus('Starting camera...', 'info', 1500);

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      cameraStream = stream;
      camera.srcObject = cameraStream;
      currentTrack = cameraStream.getVideoTracks()[0];

      camera.style.display = 'block';
      cameraPlaceholder.style.display = 'none';
      scannerContainer.classList.add('camera-active');

      isScanningActive = true;
      showStatus('Camera active. Point at a QR code.', 'success');

      await camera.play();
      scanVideoFrames();

    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        showStatus('Camera permission denied. Allow camera in browser settings.', 'error');
      } else if (err.name === 'NotFoundError') {
        showStatus('No camera found on this device.', 'error');
      } else {
        showStatus('Unable to access camera. You can upload an image below.', 'error');
      }
      stopCamera();
    }
  }

  // Camera stop
  function stopCamera() {
    isScanningActive = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
      currentTrack = null;
    }

    camera.srcObject = null;
    camera.style.display = 'none';
    cameraPlaceholder.style.display = 'flex';
    scannerContainer.classList.remove('camera-active');

    flashOn = false;
    flashBtn.classList.remove('active');
  }

  // Frame decoding loop
  function scanVideoFrames() {
    if (!isScanningActive) return;

    if (camera.readyState === camera.HAVE_ENOUGH_DATA) {
      const width = camera.videoWidth;
      const height = camera.videoHeight;

      if (width > 0 && height > 0) {
        qrCanvas.width = width;
        qrCanvas.height = height;
        canvasCtx.drawImage(camera, 0, 0, width, height);

        const imageData = canvasCtx.getImageData(0, 0, width, height);

        if (typeof jsQR !== 'undefined') {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data && code.data.trim()) {
            handleDecodedCode(code.data);
            return;
          }
        }
      }
    }

    animationFrameId = requestAnimationFrame(scanVideoFrames);
  }

  // Handle detected QR
  function handleDecodedCode(data) {
    latestScannedCode = data.trim();

    try {
      if ('vibrate' in navigator) navigator.vibrate(60);
    } catch {}

    isScanningActive = false;
    showStatus('QR code successfully detected!', 'success', 2500);

    scannedPayload.textContent = latestScannedCode;

    const isUrl = /^https?:\/\//i.test(latestScannedCode);
    if (isUrl) {
      openLinkBtn.style.display = 'inline-flex';
      openLinkBtn.onclick = () => window.open(latestScannedCode, '_blank', 'noopener,noreferrer');
    } else {
      openLinkBtn.style.display = 'none';
    }

    // Check if it matches an existing post
    const matched = posts.find(p => p.qrDestination === latestScannedCode || latestScannedCode.includes(p.id));
    if (matched) {
      scannedPayload.innerHTML = `
        <strong>Matched SENND Post:</strong><br>
        <span style="color: var(--green-dark);">${matched.title}</span> (${matched.category})<br>
        <small style="color: var(--gray);">${latestScannedCode}</small>
      `;
      openLinkBtn.style.display = 'inline-flex';
      openLinkBtn.onclick = () => {
        resultModal.classList.remove('open');
        openDetailModal(matched);
      };
    }

    resultModal.classList.add('open');
  }

  // Start / Stop camera listeners
  if (startCameraBtn) startCameraBtn.addEventListener('click', startCamera);
  if (stopCameraBtn) {
    stopCameraBtn.addEventListener('click', () => {
      stopCamera();
      showStatus('Camera stopped.', 'info', 2000);
    });
  }

  // Page visibility listener
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && cameraStream) {
      stopCamera();
    }
  });

  // Flashlight button
  if (flashBtn) {
    flashBtn.addEventListener('click', async () => {
      if (!currentTrack) {
        showStatus('Start the camera first to use flashlight.', 'info');
        return;
      }

      const capabilities = currentTrack.getCapabilities ? currentTrack.getCapabilities() : {};
      if (!capabilities.torch) {
        showStatus('Flashlight is not supported on this device/camera.', 'error');
        return;
      }

      try {
        flashOn = !flashOn;
        await currentTrack.applyConstraints({ advanced: [{ torch: flashOn }] });
        flashBtn.classList.toggle('active', flashOn);
        showStatus(flashOn ? 'Flashlight ON' : 'Flashlight OFF', 'info', 2000);
      } catch (err) {
        flashOn = false;
        flashBtn.classList.remove('active');
        showStatus('Could not toggle flashlight.', 'error');
      }
    });
  }

  // Location button
  if (locationBtn) {
    locationBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showStatus('Geolocation is not supported by your browser.', 'error');
        return;
      }

      showStatus('Detecting location...', 'info');

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          locationBtn.classList.add('active');
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            if (res.ok) {
              const data = await res.json();
              const city = data.address?.city || data.address?.town || data.address?.state || 'Nearby';
              showStatus(`Location: ${city} (${lat.toFixed(3)}, ${lon.toFixed(3)})`, 'success', 5000);
              return;
            }
          } catch {}

          showStatus(`Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, 'success', 5000);
        },
        (err) => {
          locationBtn.classList.remove('active');
          showStatus('Location permission denied or unavailable.', 'error');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  // =========================================================================
  // EXPLORE ROW (UPLOAD IMAGE, POST IMAGE, PRODUCT DOWNLOAD)
  // =========================================================================

  // 1. Upload Image -> scans QR inside file
  if (uploadImageBtn && imageInput) {
    uploadImageBtn.addEventListener('click', () => {
      imageInput.click();
    });
  }

  if (imageInput) {
    imageInput.addEventListener('change', () => {
      const file = imageInput.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imgUrl = e.target.result;
        if (previewImg) previewImg.src = imgUrl;

        const tempImg = new Image();
        tempImg.onload = () => {
          qrCanvas.width = tempImg.width;
          qrCanvas.height = tempImg.height;
          canvasCtx.drawImage(tempImg, 0, 0);

          try {
            const imgData = canvasCtx.getImageData(0, 0, tempImg.width, tempImg.height);
            const code = typeof jsQR !== 'undefined' ? jsQR(imgData.data, imgData.width, imgData.height) : null;

            if (code && code.data) {
              if (imageQrResultBox) imageQrResultBox.style.display = 'block';
              if (imageQrPayload) imageQrPayload.textContent = code.data;
              if (/^https?:\/\//i.test(code.data)) {
                if (imageOpenLinkBtn) {
                  imageOpenLinkBtn.style.display = 'inline-flex';
                  imageOpenLinkBtn.onclick = () => window.open(code.data, '_blank');
                }
              } else {
                if (imageOpenLinkBtn) imageOpenLinkBtn.style.display = 'none';
              }
              showStatus('QR Code successfully decoded from image!', 'success');
            } else {
              if (imageQrResultBox) imageQrResultBox.style.display = 'none';
              if (imageOpenLinkBtn) imageOpenLinkBtn.style.display = 'none';
              showStatus(`Loaded: ${file.name}. No QR code found in this image.`, 'info');
            }
          } catch {
            if (imageQrResultBox) imageQrResultBox.style.display = 'none';
            if (imageOpenLinkBtn) imageOpenLinkBtn.style.display = 'none';
          }

          if (imagePreviewModal) imagePreviewModal.classList.add('open');
        };
        tempImg.src = imgUrl;
      };
      reader.readAsDataURL(file);
      imageInput.value = '';
    });
  }

  // 2. Post Image -> Opens post creation modal with photo preview
  pendingPostImageUrl = '';
  if (uploadPostBtn && postInput) {
    uploadPostBtn.addEventListener('click', () => {
      postInput.click();
    });
  }

  // Header quick create button
  const openCreatePostBtn = document.getElementById('openCreatePostBtn');
  if (openCreatePostBtn && postModal) {
    openCreatePostBtn.addEventListener('click', () => {
      if (postPreviewWrap) postPreviewWrap.style.display = 'none';
      pendingPostImageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
      postModal.classList.add('open');
    });
  }

  if (postInput) {
    postInput.addEventListener('change', () => {
      const file = postInput.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        pendingPostImageUrl = e.target.result;
        if (postPreviewImg) postPreviewImg.src = pendingPostImageUrl;
        if (postPreviewWrap) postPreviewWrap.style.display = 'flex';
        if (postModal) postModal.classList.add('open');
      };
      reader.readAsDataURL(file);
      postInput.value = '';
    });
  }

  // Publish new post
  if (publishPostBtn) {
    publishPostBtn.addEventListener('click', () => {
      const title = newPostTitle ? newPostTitle.value.trim() : '';
      const url = newPostUrl ? newPostUrl.value.trim() : '';

      if (!title || !url) {
        alert('Please provide a post title and valid destination URL.');
        return;
      }

      const newPost = {
        id: `sennd-${Date.now()}`,
        title: title,
        category: newPostCategory ? newPostCategory.value : 'Product',
        description: (newPostDesc && newPostDesc.value.trim()) || 'Scannable SENND community post.',
        qrDestination: url,
        location: (newPostLoc && newPostLoc.value.trim()) || 'Online',
        image: pendingPostImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        details: 'Published via SENND mobile platform.'
      };

      posts.unshift(newPost);
      localStorage.setItem('sennd_posts', JSON.stringify(posts));

      // Reset inputs
      if (newPostTitle) newPostTitle.value = '';
      if (newPostDesc) newPostDesc.value = '';
      if (newPostLoc) newPostLoc.value = '';
      if (newPostUrl) newPostUrl.value = '';
      if (postModal) postModal.classList.remove('open');

      // Return to home and render new post
      renderPosts();
      switchToView('homeView');
      showStatus('New QR Post published successfully!', 'success');
    });
  }

  // 3. Product / Download Modal
  if (productBtn && productModal) {
    productBtn.addEventListener('click', () => {
      productModal.classList.add('open');
    });
  }

  document.querySelectorAll('.download-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const fileName = e.currentTarget.getAttribute('data-download') || 'SENND-Asset.pdf';
      showStatus(`Downloading ${fileName}...`, 'success', 3000);

      const blob = new Blob([`SENND Printable Resource: ${fileName}\nCreated for Stick. Scan. Share.`], { type: 'text/plain' });
      const dlLink = document.createElement('a');
      dlLink.href = URL.createObjectURL(blob);
      dlLink.download = fileName;
      dlLink.click();
    });
  });

  // =========================================================================
  // SEARCH ROW (SEARCH, IMAGE SEARCH, VOICE SEARCH)
  // =========================================================================
  if (searchBtn && searchInputBox && scannerSearchInput) {
    searchBtn.addEventListener('click', () => {
      searchInputBox.classList.add('show');
      scannerSearchInput.focus();
      showStatus('Type search keyword or paste a URL.', 'info', 2000);
    });
  }

  if (closeSearch && searchInputBox && scannerSearchInput) {
    closeSearch.addEventListener('click', () => {
      scannerSearchInput.value = '';
      searchInputBox.classList.remove('show');
      showStatus('');
    });
  }

  if (scannerSearchInput) {
    scannerSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = scannerSearchInput.value.trim();
        if (!query) return;

        // Transfer query to Home Page search and switch to Home
        searchQuery = query;
        renderPosts();
        switchToView('homeView');
      }
    });
  }

  if (imageSearchBtn && imageInput) {
    imageSearchBtn.addEventListener('click', () => {
      imageInput.click();
    });
  }

  // Voice Search (Speech Recognition)
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        showStatus('Voice search is not supported in this browser.', 'error');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN'; // Supports Hindi and English
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        voiceBtn.classList.add('active');
        showStatus('Listening... Speak now in Hindi or English.', 'info', 5000);

        recognition.onstart = () => {
          voiceBtn.style.color = '#10b981';
        };

        recognition.onresult = (event) => {
          voiceBtn.classList.remove('active');
          voiceBtn.style.color = '';
          const transcript = event.results[0][0].transcript;

          if (scannerSearchInput) scannerSearchInput.value = transcript;
          if (searchInputBox) searchInputBox.classList.add('show');
          showStatus(`Voice recognized: "${transcript}"`, 'success', 3500);

          searchQuery = transcript;
          renderPosts();
        };

        recognition.onerror = (event) => {
          voiceBtn.classList.remove('active');
          voiceBtn.style.color = '';
          showStatus(`Voice search error: ${event.error}`, 'error');
        };

        recognition.onend = () => {
          voiceBtn.classList.remove('active');
          voiceBtn.style.color = '';
        };

        recognition.start();
      } catch {
        voiceBtn.classList.remove('active');
        showStatus('Could not initiate voice recognition.', 'error');
      }
    });
  }

  // =========================================================================
  // DETAIL MODAL & QR MODAL LOGIC
  // =========================================================================
  const detailModal = document.getElementById('detailModal');
  const closeDetailModal = document.getElementById('closeDetailModal');
  const modalCategory = document.getElementById('modalCategory');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalLocation = document.getElementById('modalLocation');
  const modalLocationWrap = document.getElementById('modalLocationWrap');
  const modalQrPreviewBox = document.getElementById('modalQrPreviewBox');
  const modalQrUrl = document.getElementById('modalQrUrl');
  const modalDownloadStickerBtn = document.getElementById('modalDownloadStickerBtn');
  const modalSaveBtn = document.getElementById('modalSaveBtn');
  const modalSaveText = document.getElementById('modalSaveText');
  const modalShareBtn = document.getElementById('modalShareBtn');

  // activeModalPost state variable is declared at the top of the scope
  activeModalPost = null;

  function openDetailModal(post) {
    activeModalPost = post;
    if (modalCategory) modalCategory.textContent = post.category;
    if (modalImage) modalImage.src = post.image;
    if (modalTitle) modalTitle.textContent = post.title;
    if (modalDescription) modalDescription.textContent = post.description + (post.details ? `\n\n${post.details}` : '');

    const modalMetaType = document.getElementById('modalMetaType');
    if (modalMetaType) {
      modalMetaType.textContent = post.price ? `${post.price} · ${post.category}` : `SENND ${post.category}`;
    }

    if (modalLocationWrap && modalLocation) {
      if (post.location) {
        modalLocation.textContent = post.location;
        modalLocationWrap.style.display = 'flex';
      } else {
        modalLocationWrap.style.display = 'none';
      }
    }

    if (modalQrUrl) modalQrUrl.textContent = post.qrDestination;

    // Render QR in detail preview box
    if (modalQrPreviewBox) {
      modalQrPreviewBox.innerHTML = '';
      if (typeof QRCode !== 'undefined') {
        new QRCode(modalQrPreviewBox, {
          text: post.qrDestination,
          width: 62,
          height: 62,
          colorDark: '#171717',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      }

      modalQrPreviewBox.onclick = (e) => {
        e.stopPropagation();
        openQrModal(post);
      };
    }

    const isSaved = savedIds.includes(post.id);
    if (modalSaveText) modalSaveText.textContent = isSaved ? 'Saved' : 'Save';
    if (modalSaveBtn) modalSaveBtn.style.color = isSaved ? 'var(--green-dark)' : '';

    if (detailModal) detailModal.classList.add('open');
  }

  if (modalSaveBtn) {
    modalSaveBtn.addEventListener('click', () => {
      if (!activeModalPost) return;
      const isSaved = savedIds.includes(activeModalPost.id);
      if (isSaved) {
        savedIds = savedIds.filter(id => id !== activeModalPost.id);
        if (modalSaveText) modalSaveText.textContent = 'Save';
        modalSaveBtn.style.color = '';
      } else {
        savedIds.push(activeModalPost.id);
        if (modalSaveText) modalSaveText.textContent = 'Saved';
        modalSaveBtn.style.color = 'var(--green-dark)';
      }
      localStorage.setItem('sennd_saved_posts', JSON.stringify(savedIds));
      renderPosts();
    });
  }

  if (modalShareBtn) {
    modalShareBtn.addEventListener('click', () => {
      if (activeModalPost) sharePost(activeModalPost);
    });
  }

  if (modalDownloadStickerBtn) {
    modalDownloadStickerBtn.addEventListener('click', () => {
      if (activeModalPost) downloadSticker(activeModalPost);
    });
  }

  // Large QR Modal
  const qrModal = document.getElementById('qrModal');
  const closeQrModal = document.getElementById('closeQrModal');
  const qrModalPostTitle = document.getElementById('qrModalPostTitle');
  const largeQrContainer = document.getElementById('largeQrContainer');
  const qrModalDestination = document.getElementById('qrModalDestination');
  const downloadStickerCardBtn = document.getElementById('downloadStickerCardBtn');

  function openQrModal(post) {
    activeModalPost = post;
    if (qrModalPostTitle) qrModalPostTitle.textContent = post.title;
    if (qrModalDestination) qrModalDestination.textContent = post.qrDestination;
    if (largeQrContainer) {
      largeQrContainer.innerHTML = '';
      if (typeof QRCode !== 'undefined') {
        new QRCode(largeQrContainer, {
          text: post.qrDestination,
          width: 200,
          height: 200,
          colorDark: '#171717',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    }

    if (qrModal) qrModal.classList.add('open');
  }

  if (downloadStickerCardBtn) {
    downloadStickerCardBtn.addEventListener('click', () => {
      if (activeModalPost) downloadSticker(activeModalPost);
    });
  }

  // Download high-resolution sticker PNG
  function downloadSticker(post) {
    const canvas = document.createElement('canvas');
    const width = 500;
    const height = 620;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // 3-color accent strip at top
    ctx.fillStyle = '#b8f36b';
    ctx.fillRect(0, 0, width * 0.5, 8);
    ctx.fillStyle = '#ff8c42';
    ctx.fillRect(width * 0.5, 0, width * 0.3, 8);
    ctx.fillStyle = '#171717';
    ctx.fillRect(width * 0.8, 0, width * 0.2, 8);

    // Brand
    ctx.fillStyle = '#171717';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SENND', width / 2, 50);

    ctx.fillStyle = '#737373';
    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('STICK · SCAN · SHARE', width / 2, 68);

    // Get QR image from container
    const qrCanvasElem = (largeQrContainer && largeQrContainer.querySelector('canvas')) || (modalQrPreviewBox && modalQrPreviewBox.querySelector('canvas'));
    if (qrCanvasElem) {
      ctx.drawImage(qrCanvasElem, 75, 95, 350, 350);
    }

    // Title
    ctx.fillStyle = '#171717';
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(post.title, width / 2, 485);

    // Scan instruction pill
    ctx.fillStyle = '#b8f36b';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 120, 520, 240, 38, 19);
    ctx.fill();

    ctx.fillStyle = '#171717';
    ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SCAN WITH ANY CAMERA', width / 2, 544);

    const link = document.createElement('a');
    link.download = `SENND-${post.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // Copy result button
  if (copyResultBtn) {
    copyResultBtn.addEventListener('click', async () => {
      if (!latestScannedCode) return;
      try {
        await navigator.clipboard.writeText(latestScannedCode);
        copyResultBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i> <span>Copied!</span>';
        setTimeout(() => {
          copyResultBtn.innerHTML = '<i class="fa-regular fa-copy"></i> <span>Copy Text</span>';
        }, 2000);
      } catch {
        alert('Failed to copy to clipboard.');
      }
    });
  }

  // Scan again button
  if (scanAgainBtn) {
    scanAgainBtn.addEventListener('click', () => {
      if (resultModal) resultModal.classList.remove('open');
      if (!cameraStream) {
        startCamera();
      } else {
        isScanningActive = true;
        scanVideoFrames();
      }
    });
  }

  // Modal Closers
  if (closeResultModal && resultModal) closeResultModal.addEventListener('click', () => resultModal.classList.remove('open'));
  if (closeDetailModal && detailModal) closeDetailModal.addEventListener('click', () => detailModal.classList.remove('open'));
  if (closeQrModal && qrModal) closeQrModal.addEventListener('click', () => qrModal.classList.remove('open'));
  if (closeImageModal && imagePreviewModal) closeImageModal.addEventListener('click', () => imagePreviewModal.classList.remove('open'));
  if (closePostModal && postModal) closePostModal.addEventListener('click', () => postModal.classList.remove('open'));
  if (closeProductModal && productModal) closeProductModal.addEventListener('click', () => productModal.classList.remove('open'));

  // iOS Install Modal Closers
  const iosInstallModal = document.getElementById('iosInstallModal');
  const closeIosInstallModal = document.getElementById('closeIosInstallModal');
  const dismissIosModalBtn = document.getElementById('dismissIosModalBtn');
  if (closeIosInstallModal && iosInstallModal) {
    closeIosInstallModal.addEventListener('click', () => iosInstallModal.classList.remove('open'));
  }
  if (dismissIosModalBtn && iosInstallModal) {
    dismissIosModalBtn.addEventListener('click', () => iosInstallModal.classList.remove('open'));
  }

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
      }
    });
  });

  // =========================================================================
  // PROGRESSIVE WEB APP (PWA) ENGINE — PWABUILDER & W3C COMPLIANT
  // =========================================================================
  const installAppBtn = document.getElementById('installAppBtn');
  const pwaInstallBanner = document.getElementById('pwaInstallBanner');
  const pwaBannerInstallBtn = document.getElementById('pwaBannerInstallBtn');
  const pwaBannerDismissBtn = document.getElementById('pwaBannerDismissBtn');
  const pwaUpdateToast = document.getElementById('pwaUpdateToast');
  const pwaUpdateReloadBtn = document.getElementById('pwaUpdateReloadBtn');
  const pwaOfflinePill = document.getElementById('pwaOfflinePill');

  let deferredPrompt = null;
  let newWorker = null;

  // 1. Detect Standalone Mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://');

  // 2. Detect iOS Safari
  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua) && !window.MSStream;

  // 3. Online / Offline Status Monitoring
  const updateOnlineStatus = () => {
    if (pwaOfflinePill) {
      if (!navigator.onLine) {
        pwaOfflinePill.classList.remove('hidden');
      } else {
        pwaOfflinePill.classList.add('hidden');
      }
    }
  };
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // 4. Handle In-App Install Prompt
  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[SENND PWA] User install choice:', outcome);
      deferredPrompt = null;
      if (installAppBtn) installAppBtn.classList.add('hidden');
      if (pwaInstallBanner) pwaInstallBanner.classList.add('hidden');
    } else if (isIos && !isStandalone) {
      if (iosInstallModal) {
        iosInstallModal.classList.add('open');
      }
    }
  };

  if (pwaBannerInstallBtn) {
    pwaBannerInstallBtn.addEventListener('click', promptInstall);
  }
  if (installAppBtn) {
    installAppBtn.addEventListener('click', promptInstall);
  }
  if (pwaBannerDismissBtn && pwaInstallBanner) {
    pwaBannerDismissBtn.addEventListener('click', () => {
      pwaInstallBanner.classList.add('hidden');
      localStorage.setItem('sennd_banner_dismissed', 'true');
    });
  }

  // Show banner/header button if beforeinstallprompt fires
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;

    if (!isStandalone) {
      if (installAppBtn) installAppBtn.classList.remove('hidden');
      const isDismissed = localStorage.getItem('sennd_banner_dismissed') === 'true';
      if (!isDismissed && pwaInstallBanner) {
        pwaInstallBanner.classList.remove('hidden');
      }
    }
  });

  // If on iOS and not standalone, provide install action in header
  if (isIos && !isStandalone) {
    if (installAppBtn) installAppBtn.classList.remove('hidden');
  }

  window.addEventListener('appinstalled', () => {
    console.log('[SENND PWA] SENND was successfully installed to Home Screen');
    deferredPrompt = null;
    if (installAppBtn) installAppBtn.classList.add('hidden');
    if (pwaInstallBanner) pwaInstallBanner.classList.add('hidden');
  });

  // 5. Register Service Worker with Scope and Update Checking
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('[SENND SW] Registered successfully with scope:', registration.scope);

          // Check if an updated worker is already waiting
          if (registration.waiting) {
            newWorker = registration.waiting;
            showUpdateToast();
          }

          // Listen for new worker installs
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available
                newWorker = installingWorker;
                showUpdateToast();
              }
            });
          });
        })
        .catch((err) => {
          console.warn('[SENND SW] Registration failed:', err);
        });

      // Reload page when new active service worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }

  function showUpdateToast() {
    if (pwaUpdateToast) {
      pwaUpdateToast.classList.remove('hidden');
    }
  }

  if (pwaUpdateReloadBtn) {
    pwaUpdateReloadBtn.addEventListener('click', () => {
      if (newWorker) {
        newWorker.postMessage({ action: 'SKIP_WAITING' });
      } else {
        window.location.reload();
      }
    });
  }
});

