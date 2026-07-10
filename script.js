// Polyfill requestAnimationFrame
window.requestAnimationFrame = window.__requestAnimationFrame ||
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  (function() {
    return function(callback, element) {
      var lastTime = element.__lastTime;
      if (lastTime === undefined) lastTime = 0;
      var currTime = Date.now();
      var timeToCall = Math.max(1, 33 - (currTime - lastTime));
      window.setTimeout(callback, timeToCall);
      element.__lastTime = currTime + timeToCall;
    };
  })();

// Phát hiện thiết bị
window.isDevice = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
  ((navigator.userAgent || navigator.vendor || window.opera)).toLowerCase()
));

var loaded = false;

// === HÀM KHỞI TẠO CANVAS SẮC NÉT CHO MOBILE ===
function setupCanvas(canvas, ctx) {
    var dpr = window.devicePixelRatio || 1;
    var mobile = window.isDevice;
    var koef = mobile ? 0.6 : 1; // Tăng lên 0.6 để rõ hơn trên mobile
    
    // Kích thước hiển thị (CSS)
    var displayWidth = koef * window.innerWidth;
    var displayHeight = koef * window.innerHeight;
    
    // Kích thước thực tế (vẽ) - nhân với dpr để sắc nét
    var width = displayWidth * dpr;
    var height = displayHeight * dpr;
    
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // Reset scale trước khi set lại
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    return {
        width: displayWidth,
        height: displayHeight,
        dpr: dpr,
        displayWidth: displayWidth,
        displayHeight: displayHeight
    };
}

var init = function() {
  if (loaded) return;
  loaded = true;

  var mobile = window.isDevice;
  var canvas = document.getElementById('heart');
  var ctx = canvas.getContext('2d');
  var rand = Math.random;
  
  // === KHỞI TẠO CANVAS SẮC NÉT ===
  var size = setupCanvas(canvas, ctx);
  var width = size.width;
  var height = size.height;
  var dpr = size.dpr;

  // Cấu hình - Tối ưu cho mobile
  var config = {
    speed: 1.0,
    particleCount: mobile ? 60 : 150, // Giảm số hạt trên mobile
    traceCount: mobile ? 12 : 40, // Giảm trace trên mobile
    color: '#ff1744',
    showText: true,
    text: '❤ Have a good day ❤',
    traceK: 0.4,
    timeDelta: 0.01,
    showShootingStars: true
  };

  // Bảng màu
  var colorMap = {
    // Hàng 1: Màu cơ bản (12 màu)
    red: { hue: 0, sat: 80, light: 50 },
    crimson: { hue: 350, sat: 85, light: 45 },
    darkRed: { hue: 0, sat: 90, light: 35 },
    pink: { hue: 340, sat: 70, light: 65 },
    darkPink: { hue: 340, sat: 80, light: 45 },
    rose: { hue: 340, sat: 60, light: 70 },
    salmon: { hue: 10, sat: 70, light: 65 },
    coral: { hue: 10, sat: 80, light: 60 },
    peach: { hue: 20, sat: 60, light: 70 },
    orange: { hue: 30, sat: 90, light: 55 },
    amber: { hue: 45, sat: 90, light: 50 },
    gold: { hue: 45, sat: 90, light: 55 },
    
    // Hàng 2: Màu mở rộng (12 màu)
    purple: { hue: 280, sat: 70, light: 55 },
    darkPurple: { hue: 280, sat: 80, light: 35 },
    violet: { hue: 270, sat: 70, light: 50 },
    lavender: { hue: 260, sat: 50, light: 65 },
    magenta: { hue: 300, sat: 80, light: 50 },
    indigo: { hue: 230, sat: 70, light: 50 },
    blue: { hue: 220, sat: 80, light: 55 },
    lightBlue: { hue: 210, sat: 70, light: 60 },
    cyan: { hue: 190, sat: 90, light: 50 },
    teal: { hue: 180, sat: 80, light: 50 },
    turquoise: { hue: 175, sat: 80, light: 45 },
    green: { hue: 140, sat: 80, light: 50 },
    lime: { hue: 120, sat: 80, light: 50 },
    mint: { hue: 150, sat: 70, light: 55 },
    chocolate: { hue: 30, sat: 60, light: 30 },
    white: { hue: 0, sat: 0, light: 90 }
  };

  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, width, height);

  // === TẠO HIỆU ỨNG SAO BĂNG ===
  
  // Tạo các ngôi sao nền - Giảm số lượng trên mobile
  var stars = [];
  var starCount = mobile ? 50 : 150;
  for (var i = 0; i < starCount; i++) {
    stars.push({
      x: rand() * width,
      y: rand() * height,
      size: rand() * 2 + 0.5,
      opacity: rand() * 0.5 + 0.3,
      twinkleSpeed: rand() * 0.02 + 0.01,
      twinkleOffset: rand() * Math.PI * 2
    });
  }

  // Tạo sao băng - Giảm số lượng trên mobile
  var shootingStars = [];
  var maxShootingStars = mobile ? 3 : 6;

  var createShootingStar = function() {
    var fromX, fromY, angle;
    var corner = Math.floor(rand() * 4);
    
    switch(corner) {
      case 0:
        fromX = rand() * width * 0.3;
        fromY = rand() * height * 0.2;
        angle = Math.PI / 4 + rand() * 0.3;
        break;
      case 1:
        fromX = width - rand() * width * 0.3;
        fromY = rand() * height * 0.2;
        angle = Math.PI * 3/4 - rand() * 0.3;
        break;
      case 2:
        fromX = rand() * width * 0.1;
        fromY = rand() * height * 0.5;
        angle = Math.PI / 6 + rand() * 0.2;
        break;
      case 3:
        fromX = width - rand() * width * 0.1;
        fromY = rand() * height * 0.5;
        angle = Math.PI * 5/6 - rand() * 0.2;
        break;
    }

    var length = mobile ? rand() * 80 + 40 : rand() * 200 + 100;
    var speed = mobile ? rand() * 2 + 1.5 : rand() * 5 + 3;

    return {
      x: fromX,
      y: fromY,
      length: length,
      angle: angle,
      speed: speed * (0.8 + rand() * 0.4),
      opacity: rand() * 0.5 + 0.5,
      life: 1,
      maxLife: 1,
      tail: [],
      color: config.color,
      width: rand() * 2 + 1,
      active: true
    };
  };

  for (var i = 0; i < Math.min(2, maxShootingStars); i++) {
    var star = createShootingStar();
    star.life = rand() * 0.5;
    shootingStars.push(star);
  }

  var drawShootingStars = function() {
    if (!config.showShootingStars) return;

    for (var i = 0; i < stars.length; i++) {
      var star = stars[i];
      var twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
      var alpha = star.opacity * twinkle;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255,255,255,0.2)';
      ctx.fillRect(star.x, star.y, star.size, star.size);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;

    if (shootingStars.length < maxShootingStars && rand() < 0.008 * config.speed) {
      shootingStars.push(createShootingStar());
    }

    for (var i = shootingStars.length - 1; i >= 0; i--) {
      var star = shootingStars[i];
      
      if (!star.active) {
        shootingStars.splice(i, 1);
        continue;
      }

      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      star.life -= 0.005 * config.speed;

      star.tail.push({ x: star.x, y: star.y });
      if (star.tail.length > Math.floor(star.length / 3)) {
        star.tail.shift();
      }

      if (star.life <= 0 || 
          star.x < -50 || star.x > width + 50 || 
          star.y < -50 || star.y > height + 50) {
        star.active = false;
        shootingStars.splice(i, 1);
        continue;
      }

      ctx.save();
      
      var tailLength = star.tail.length;
      for (var j = 0; j < tailLength; j++) {
        var progress = j / tailLength;
        var alpha = star.opacity * star.life * progress * 0.8;
        
        var colorInfo = colorMap[config.color] || colorMap.red;
        var hue = colorInfo.hue + (1 - progress) * 20;
        var sat = colorInfo.sat - (1 - progress) * 20;
        var light = colorInfo.light + (1 - progress) * 30;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'hsla(' + hue + ',' + sat + '%,' + light + '%,1)';
        
        var size = star.width * (1 - progress * 0.5);
        ctx.shadowBlur = 20 * (1 - progress);
        ctx.shadowColor = config.color;
        ctx.fillRect(star.tail[j].x - size/2, star.tail[j].y - size/2, size, size);
      }
      
      ctx.globalAlpha = star.opacity * star.life;
      ctx.shadowBlur = 40;
      ctx.shadowColor = config.color;
      ctx.fillStyle = '#ffffff';
      var headSize = star.width * 2;
      ctx.beginPath();
      ctx.arc(star.x, star.y, headSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = star.opacity * star.life * 0.3;
      ctx.shadowBlur = 80;
      ctx.shadowColor = config.color;
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, headSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  };

  // Hàm tạo trái tim
  var heartPosition = function(rad) {
    return [
      Math.pow(Math.sin(rad), 3),
      -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))
    ];
  };

  var scaleAndTranslate = function(pos, sx, sy, dx, dy) {
    return [dx + pos[0] * sx, dy + pos[1] * sy];
  };

  // Tạo điểm cho trái tim - Tối ưu cho mobile
  var generateHeartPoints = function() {
    var points = [];
    var dr = mobile ? 0.3 : 0.1; // Giảm độ phân giải trên mobile
    var scales = mobile ? [
      [140, 9],
      [100, 6],
      [60, 3]
    ] : [
      [210, 13],
      [150, 9],
      [90, 5]
    ];
    
    for (var s = 0; s < scales.length; s++) {
      for (var i = 0; i < Math.PI * 2; i += dr) {
        points.push(scaleAndTranslate(
          heartPosition(i),
          scales[s][0],
          scales[s][1],
          0, 0
        ));
      }
    }
    return points;
  };

  var pointsOrigin = generateHeartPoints();
  var heartPointsCount = pointsOrigin.length;
  var targetPoints = [];

  var pulse = function(kx, ky) {
    for (var i = 0; i < pointsOrigin.length; i++) {
      targetPoints[i] = [
        kx * pointsOrigin[i][0] + width / 2,
        ky * pointsOrigin[i][1] + height / 2
      ];
    }
  };

  // Tạo hạt
  var particles = [];
  var createParticles = function(count) {
    particles = [];
    var color = config.color;
    var colorInfo = colorMap[color] || colorMap.red;
    
    for (var i = 0; i < count; i++) {
      var x = rand() * width;
      var y = rand() * height;
      var hue = colorInfo.hue + (rand() - 0.5) * 20;
      var sat = colorInfo.sat + (rand() - 0.5) * 20;
      var light = colorInfo.light + (rand() - 0.5) * 30;
      
      particles[i] = {
        vx: 0,
        vy: 0,
        R: mobile ? 1.2 : 2,
        speed: (rand() + 2) * 0.7, // Giảm tốc độ trên mobile
        q: ~~(rand() * heartPointsCount),
        D: 2 * (i % 2) - 1,
        force: 0.2 * rand() + 0.5,
        f: "hsla(" + hue + "," + sat + "%," + light + "%,0.4)",
        trace: []
      };
      
      var traceCount = config.traceCount;
      for (var k = 0; k < traceCount; k++) {
        particles[i].trace[k] = { x: x, y: y };
      }
    }
  };

  createParticles(config.particleCount);

  // Biến điều khiển
  var time = 0;
  var textX = width / 2;
  var textY = height / 2 + 120;

  // Hàm vẽ chữ - Tối ưu font size trên mobile
  var drawText = function() {
    if (!config.showText) return;
    
    var text = config.text;
    var fontSize = Math.min(width / 10, height / 7, mobile ? 50 : 70);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    var textYOffset = -height / 2.8;
    
    var gradient = ctx.createLinearGradient(
        textX - fontSize * 2, 
        textY + textYOffset - fontSize/2,
        textX + fontSize * 2, 
        textY + textYOffset + fontSize/2
    );
    
    var colorInfo = colorMap[config.color] || colorMap.red;
    gradient.addColorStop(0, 'hsla(' + colorInfo.hue + ',' + colorInfo.sat + '%,' + (colorInfo.light + 20) + '%,1)');
    gradient.addColorStop(0.5, 'hsla(' + (colorInfo.hue + 20) + ',' + (colorInfo.sat + 10) + '%,' + (colorInfo.light + 40) + '%,1)');
    gradient.addColorStop(1, 'hsla(' + colorInfo.hue + ',' + colorInfo.sat + '%,' + (colorInfo.light + 20) + '%,1)');
    
    ctx.font = '700 ' + fontSize + 'px "Dancing Script", cursive, sans-serif';
    
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText(text, textX + 3, textY + textYOffset + 3);
    
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = gradient;
    ctx.fillText(text, textX, textY + textYOffset);
    
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 80;
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#fff';
    ctx.fillText(text, textX, textY + textYOffset);
    ctx.globalAlpha = 1;
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeText(text, textX, textY + textYOffset);
    
    // Giảm sparkle trên mobile
    var sparkleCount = mobile ? 6 : 8;
    for (var i = 0; i < sparkleCount; i++) {
        var angle = (i / sparkleCount) * Math.PI * 2 + time * 0.5;
        var radius = fontSize * 0.7 + Math.sin(time * 2 + i) * 8;
        var sx = textX + Math.cos(angle) * radius;
        var sy = textY + textYOffset + Math.sin(angle) * radius * 0.3;
        
        var size = 1.5 + Math.sin(time * 3 + i * 1.5) * 0.8;
        ctx.shadowBlur = 15;
        ctx.shadowColor = config.color;
        ctx.globalAlpha = 0.4 + Math.sin(time * 2 + i) * 0.2;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    } 
    
    ctx.restore();
  };

  // Vòng lặp animation
  var loop = function() {
    var speedMultiplier = config.speed;
    var n = -Math.cos(time);
    var pulseAmount = (1 + n) * 0.5;
    
    pulse(pulseAmount, pulseAmount);
    
    var timeStep = ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? 0.2 : 1) * config.timeDelta * speedMultiplier;
    time += timeStep;
    
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, width, height);
    
    drawShootingStars();
    
    var particleCount = particles.length;
    for (var i = particleCount - 1; i >= 0; i--) {
      var u = particles[i];
      var q = targetPoints[u.q];
      var dx = u.trace[0].x - q[0];
      var dy = u.trace[0].y - q[1];
      var length = Math.sqrt(dx * dx + dy * dy);
      
      if (10 > length) {
        if (0.95 < rand()) {
          u.q = ~~(rand() * heartPointsCount);
        } else {
          if (0.99 < rand()) {
            u.D *= -1;
          }
          u.q += u.D;
          u.q %= heartPointsCount;
          if (0 > u.q) {
            u.q += heartPointsCount;
          }
        }
      }
      
      u.vx += -dx / length * u.speed;
      u.vy += -dy / length * u.speed;
      u.trace[0].x += u.vx;
      u.trace[0].y += u.vy;
      u.vx *= u.force;
      u.vy *= u.force;
      
      for (var k = 0; k < u.trace.length - 1; k++) {
        var T = u.trace[k];
        var N = u.trace[k + 1];
        N.x -= config.traceK * (N.x - T.x);
        N.y -= config.traceK * (N.y - T.y);
      }
      
      ctx.fillStyle = u.f;
      var traceLen = u.trace.length;
      for (var k = 0; k < traceLen; k++) {
        ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
      }
    }
    
    drawText();
    
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 100;
    ctx.fillStyle = config.color;
    for (var i = 0; i < targetPoints.length; i += 10) {
      ctx.fillRect(targetPoints[i][0], targetPoints[i][1], 4, 4);
    }
    ctx.restore();
    
    window.requestAnimationFrame(loop, canvas);
  };

  // === ĐIỀU KHIỂN ===

  var toggleBtn = document.getElementById('toggleControlsBtn');
  var controls = document.getElementById('controls');
  var hideBtn = document.getElementById('hideControls');

  if (controls) {
    controls.classList.remove('hidden');
  }
  if (toggleBtn) {
    toggleBtn.classList.add('hidden-btn');
  }

  if (hideBtn) {
    hideBtn.addEventListener('click', function() {
      if (controls) {
        controls.classList.add('hidden');
      }
      if (toggleBtn) {
        toggleBtn.classList.remove('hidden-btn');
      }
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      if (controls) {
        controls.classList.remove('hidden');
      }
      if (toggleBtn) {
        toggleBtn.classList.add('hidden-btn');
      }
    });
  }

  var speedControl = document.getElementById('speedControl');
  if (speedControl) {
    speedControl.addEventListener('input', function(e) {
      config.speed = parseFloat(e.target.value);
      var speedValue = document.getElementById('speedValue');
      if (speedValue) speedValue.textContent = config.speed.toFixed(1);
    });
  }

  var particleControl = document.getElementById('particleControl');
  var particleTimeout;
  if (particleControl) {
    particleControl.addEventListener('input', function(e) {
      var val = parseInt(e.target.value);
      var particleValue = document.getElementById('particleValue');
      if (particleValue) particleValue.textContent = val;

      clearTimeout(particleTimeout);
      particleTimeout = setTimeout(function() {
        config.particleCount = val;
        createParticles(val);
      }, 300);
    });
  }

  document.querySelectorAll('.color-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.color-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      this.classList.add('active');

      var colorName = this.dataset.color;
      config.color = colorName;

      var colorInfo = colorMap[colorName] || colorMap.red;
      for (var i = 0; i < particles.length; i++) {
        var u = particles[i];
        var hue = colorInfo.hue + (rand() - 0.5) * 20;
        var sat = colorInfo.sat + (rand() - 0.5) * 20;
        var light = colorInfo.light + (rand() - 0.5) * 30;
        u.f = "hsla(" + hue + "," + sat + "%," + light + "%,0.4)";
      }
      
      if (customColorPicker) {
        var hexColor = getColorHex(colorName);
        if (hexColor) {
          customColorPicker.value = hexColor;
          if (colorHexValue) colorHexValue.textContent = hexColor;
          if (applyColorBtn) applyColorBtn.style.background = hexColor;
        }
      }
    });
  });

  var customColorPicker = document.getElementById('customColorPicker');
  var colorHexValue = document.getElementById('colorHexValue');
  var applyColorBtn = document.getElementById('applyColorBtn');

  if (customColorPicker) {
    customColorPicker.addEventListener('input', function(e) {
      var color = e.target.value;
      if (colorHexValue) {
        colorHexValue.textContent = color;
      }
      if (applyColorBtn) {
        applyColorBtn.style.background = color;
      }
    });
  }

  if (applyColorBtn) {
    applyColorBtn.addEventListener('click', function() {
      var color = customColorPicker.value;
      config.color = color;
      
      var colorInfo = hexToHsl(color);
      for (var i = 0; i < particles.length; i++) {
        var u = particles[i];
        var hue = colorInfo.hue + (rand() - 0.5) * 20;
        var sat = colorInfo.sat + (rand() - 0.5) * 20;
        var light = colorInfo.light + (rand() - 0.5) * 30;
        u.f = "hsla(" + hue + "," + sat + "%," + light + "%,0.4)";
      }
      
      document.querySelectorAll('.color-btn').forEach(function(b) {
        b.classList.remove('active');
      });
    });
  }

  function hexToHsl(hex) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;
    
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }
    
    return {
      hue: Math.round(h * 360),
      sat: Math.round(s * 100),
      light: Math.round(l * 100)
    };
  }

  function getColorHex(colorName) {
    var colorMapHex = {
      red: '#ff1744',
      crimson: '#d50000',
      darkRed: '#b71c1c',
      pink: '#ff6b9d',
      darkPink: '#d81b60',
      rose: '#f48fb1',
      salmon: '#ff8a80',
      coral: '#ff6b6b',
      peach: '#ffccbc',
      orange: '#ff9100',
      amber: '#ffa000',
      gold: '#ffd700',
      purple: '#9c27b0',
      darkPurple: '#4a148c',
      violet: '#8e44ad',
      lavender: '#b39ddb',
      magenta: '#e91e63',
      indigo: '#3f51b5',
      blue: '#2979ff',
      lightBlue: '#4fc3f7',
      cyan: '#00bcd4',
      teal: '#00bfa5',
      turquoise: '#1abc9c',
      green: '#00e676',
      lime: '#76ff03',
      mint: '#69f0ae',
      chocolate: '#795548',
      white: '#ffffff'
    };
    return colorMapHex[colorName] || null;
  }

  var textToggle = document.getElementById('textToggle');
  if (textToggle) {
    textToggle.addEventListener('change', function(e) {
      config.showText = e.target.checked;
    });
  }

  var updateTextBtn = document.getElementById('updateTextBtn');
  var textInput = document.getElementById('textInput');
  
  if (updateTextBtn) {
    updateTextBtn.addEventListener('click', function() {
      if (textInput) {
        var newText = textInput.value.trim();
        if (newText) {
          config.text = newText;
        }
      }
    });
  }

  if (textInput) {
    textInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        if (updateTextBtn) updateTextBtn.click();
      }
    });
  }

  var starToggle = document.getElementById('starToggle');
  if (starToggle) {
    starToggle.addEventListener('change', function(e) {
      config.showShootingStars = e.target.checked;
    });
  }

  // === RESIZE TỐI ƯU CHO MOBILE ===
  var resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        var newSize = setupCanvas(canvas, ctx);
        width = newSize.width;
        height = newSize.height;
        dpr = newSize.dpr;
        textX = width / 2;
        
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, width, height);
        
        pointsOrigin = generateHeartPoints();
        heartPointsCount = pointsOrigin.length;
        targetPoints = [];
        
        for (var i = 0; i < particles.length; i++) {
            particles[i].trace.forEach(function(t) {
                t.x = rand() * width;
                t.y = rand() * height;
            });
        }
    }, 200);
  });

  loop();
};

var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') init();
else document.addEventListener('DOMContentLoaded', init, false);