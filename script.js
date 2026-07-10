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
var init = function() {
  if (loaded) return;
  loaded = true;

  var mobile = window.isDevice;
  var koef = mobile ? 0.5 : 1;
  var canvas = document.getElementById('heart');
  var ctx = canvas.getContext('2d');
  var width = canvas.width = koef * innerWidth;
  var height = canvas.height = koef * innerHeight;
  var rand = Math.random;

  // Cấu hình
  var config = {
    speed: 1.0,
    particleCount: mobile ? 80 : 150,
    traceCount: mobile ? 15 : 40,
    color: '#ff1744',
    showText: true,
    text: '❤ Yêu Thương ❤',
    traceK: 0.4,
    timeDelta: 0.01
  };

  // Bảng màu
  var colorMap = {
    red: { hue: 0, sat: 80, light: 50 },
    pink: { hue: 340, sat: 70, light: 65 },
    purple: { hue: 280, sat: 70, light: 55 },
    blue: { hue: 220, sat: 80, light: 55 },
    green: { hue: 140, sat: 80, light: 50 },
    gold: { hue: 45, sat: 90, light: 55 },
    white: { hue: 0, sat: 0, light: 90 }
  };

  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, width, height);

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

  // Tạo điểm cho trái tim
  var generateHeartPoints = function() {
    var points = [];
    var dr = mobile ? 0.25 : 0.1;
    var scales = mobile ? [
      [160, 10],
      [120, 7],
      [70, 4]
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
        R: mobile ? 1.5 : 2,
        speed: (rand() + 3) * 0.8,
        q: ~~(rand() * heartPointsCount),
        D: 2 * (i % 2) - 1,
        force: 0.2 * rand() + 0.6,
        f: "hsla(" + hue + "," + sat + "%," + light + "%,0.4)",
        trace: []
      };
      
      // Tạo trace
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

  // Hàm vẽ chữ
  // Hàm drawText nâng cao - chữ nổi bật phía trên

var drawText = function() {
    if (!config.showText) return;
    
    var text = config.text;
    var fontSize = Math.min(width / 12, height / 8, 70);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Vị trí chữ: phía trên trái tim
    var textYOffset = -height / 3.5; // Điều chỉnh vị trí
    
    // Tạo gradient cho chữ
    var gradient = ctx.createLinearGradient(
        textX - fontSize * 2, 
        textY + textYOffset - fontSize/2,
        textX + fontSize * 2, 
        textY + textYOffset + fontSize/2
    );
    
    // Lấy màu từ config
    var colorInfo = colorMap[config.color] || colorMap.red;
    gradient.addColorStop(0, 'hsla(' + colorInfo.hue + ',' + colorInfo.sat + '%,' + (colorInfo.light + 20) + '%,1)');
    gradient.addColorStop(0.5, 'hsla(' + (colorInfo.hue + 20) + ',' + (colorInfo.sat + 10) + '%,' + (colorInfo.light + 40) + '%,1)');
    gradient.addColorStop(1, 'hsla(' + colorInfo.hue + ',' + colorInfo.sat + '%,' + (colorInfo.light + 20) + '%,1)');
    
    ctx.font = '700 ' + fontSize + 'px "Dancing Script", cursive, sans-serif';
    
    // Hiệu ứng đổ bóng nhiều lớp
    // Lớp 1: Bóng đen
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText(text, textX + 3, textY + textYOffset + 3);
    
    // Lớp 2: Bóng màu
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = gradient;
    ctx.fillText(text, textX, textY + textYOffset);
    
    // Lớp 3: Ánh sáng trắng
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 80;
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#fff';
    ctx.fillText(text, textX, textY + textYOffset);
    ctx.globalAlpha = 1;
    
    // Lớp 4: Viền sáng
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeText(text, textX, textY + textYOffset);
    
    // Hiệu ứng sparkle (các hạt lấp lánh xung quanh chữ)
    var sparkleCount = 8;
    for (var i = 0; i < sparkleCount; i++) {
        var angle = (i / sparkleCount) * Math.PI * 2 + time * 0.5;
        var radius = fontSize * 0.8 + Math.sin(time * 2 + i) * 10;
        var sx = textX + Math.cos(angle) * radius;
        var sy = textY + textYOffset + Math.sin(angle) * radius * 0.3;
        
        var size = 2 + Math.sin(time * 3 + i * 1.5) * 1;
        ctx.shadowBlur = 15;
        ctx.shadowColor = config.color;
        ctx.globalAlpha = 0.4 + Math.sin(time * 2 + i) * 0.2;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1, size), 0, Math.PI * 2);
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
    
    // Điều chỉnh tốc độ
    var timeStep = ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? 0.2 : 1) * config.timeDelta * speedMultiplier;
    time += timeStep;
    
    // Xóa mờ
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, width, height);
    
    // Cập nhật và vẽ hạt
    var particleCount = particles.length;
    for (var i = particleCount - 1; i >= 0; i--) {
      var u = particles[i];
      var q = targetPoints[u.q];
      var dx = u.trace[0].x - q[0];
      var dy = u.trace[0].y - q[1];
      var length = Math.sqrt(dx * dx + dy * dy);
      
      // Thay đổi mục tiêu
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
      
      // Cập nhật vận tốc
      u.vx += -dx / length * u.speed;
      u.vy += -dy / length * u.speed;
      u.trace[0].x += u.vx;
      u.trace[0].y += u.vy;
      u.vx *= u.force;
      u.vy *= u.force;
      
      // Cập nhật trace
      for (var k = 0; k < u.trace.length - 1; k++) {
        var T = u.trace[k];
        var N = u.trace[k + 1];
        N.x -= config.traceK * (N.x - T.x);
        N.y -= config.traceK * (N.y - T.y);
      }
      
      // Vẽ hạt
      ctx.fillStyle = u.f;
      var traceLen = u.trace.length;
      for (var k = 0; k < traceLen; k++) {
        ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
      }
    }
    
    // Vẽ chữ
    drawText();
    
    // Vẽ glow trái tim (optional)
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
  
  // Tốc độ
  document.getElementById('speedControl').addEventListener('input', function(e) {
    config.speed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = config.speed.toFixed(1);
  });

  // Số lượng hạt
  var particleTimeout;
  document.getElementById('particleControl').addEventListener('input', function(e) {
    var val = parseInt(e.target.value);
    document.getElementById('particleValue').textContent = val;
    
    clearTimeout(particleTimeout);
    particleTimeout = setTimeout(function() {
      config.particleCount = val;
      createParticles(val);
    }, 300);
  });

  // Màu sắc
  document.querySelectorAll('.color-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.color-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      this.classList.add('active');
      
      var colorName = this.dataset.color;
      config.color = colorName;
      
      // Cập nhật màu cho hạt
      var colorInfo = colorMap[colorName] || colorMap.red;
      for (var i = 0; i < particles.length; i++) {
        var u = particles[i];
        var hue = colorInfo.hue + (rand() - 0.5) * 20;
        var sat = colorInfo.sat + (rand() - 0.5) * 20;
        var light = colorInfo.light + (rand() - 0.5) * 30;
        u.f = "hsla(" + hue + "," + sat + "%," + light + "%,0.4)";
      }
    });
  });

  // Hiển thị chữ
  document.getElementById('textToggle').addEventListener('change', function(e) {
    config.showText = e.target.checked;
  });

  // Cập nhật chữ
  document.getElementById('updateTextBtn').addEventListener('click', function() {
    var newText = document.getElementById('textInput').value.trim();
    if (newText) {
      config.text = newText;
    }
  });
  
  document.getElementById('textInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      document.getElementById('updateTextBtn').click();
    }
  });

  // Ẩn/hiện controls
  document.getElementById('toggleControls').addEventListener('click', function() {
    var controls = document.getElementById('controls');
    controls.classList.toggle('hidden');
    this.textContent = controls.classList.contains('hidden') ? 'Hiện điều khiển' : 'Ẩn điều khiển';
  });

  // Resize
  var resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        var newWidth = canvas.width = koef * innerWidth;
        var newHeight = canvas.height = koef * innerHeight;
        width = newWidth;
        height = newHeight;
        textX = width / 2;
        // Không cần textY nữa vì đã dùng offset
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, width, height);
        
        // Tạo lại điểm trái tim
        pointsOrigin = generateHeartPoints();
        heartPointsCount = pointsOrigin.length;
        targetPoints = [];
        
        // Reset particles
        for (var i = 0; i < particles.length; i++) {
            particles[i].trace.forEach(function(t) {
                t.x = rand() * width;
                t.y = rand() * height;
            });
        }
    }, 200);
});

  // Khởi động
  loop();
};

// DOM ready
var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') init();
else document.addEventListener('DOMContentLoaded', init, false);