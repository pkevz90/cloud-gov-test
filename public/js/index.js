let cnvs = document.getElementsByTagName('canvas')[0];
let ctx = cnvs.getContext('2d');
cnvs.height = window.innerHeight;
cnvs.width = window.innerWidth;
let axisWidth = 100;
let axisHeight = axisWidth * cnvs.height / cnvs.width;
let timeStep = 96*3600/60/60;
let n = 2 * Math.PI / 86164;
let orbits = [];
for (let ii = 0; ii < 5; ii++) {
  orbits.push({
    a: Math.random() * axisWidth * 0.25,
    xd: Math.random() * axisWidth * 0.125 - axisWidth * 0.0625,
    yd: Math.random() * axisHeight * 0.5 - axisWidth * 0.25,
    b: Math.random() * 2 * Math.PI,
    hist: [] 
  })
}
animate()
function animate() {
  ctx.clearRect(0, 0, cnvs.width, cnvs.height);
  drawArrow(ctx, [cnvs.width / 2, cnvs.height / 2], cnvs.height * 0.3, 0, 'black', 1);
  drawArrow(ctx, [cnvs.width / 2, cnvs.height / 2], cnvs.height * 0.3, 3 * Math.PI / 2, 'black', 1);
  orbits.forEach(orbit => {
    let location = {
      x: - orbit.a / 2 * Math.cos(orbit.b) + orbit.xd,
      y: orbit.a * Math.sin(orbit.b) + orbit.yd
    }
    pixelLocation = getScreenPixel(cnvs, location.x, location.y, axisWidth, [0,0], object = true);
    orbit.hist.push(pixelLocation);
    if (orbit.hist.length > 480) {
      orbit.hist.shift();
    }
    orbit.b += timeStep * n;
    orbit.yd += -timeStep * n * orbit.xd * 3 / 2;
    // if (orbit.yd < -axisWidth / 2) {
    //   orbit.yd  += axisWidth;
    // }
    // else if (orbit.yd  > axisWidth / 2) {
    //   orbit.yd  -= axisWidth;
    // }
    drawCurve(ctx, orbit.hist, 1);
  });
  window.requestAnimationFrame(animate);
}
window.addEventListener("resize", () => {
    cnvs.height = window.innerHeight;
    cnvs.width = window.innerWidth;
    earthSize = Math.min(cnvs.height / 8 ,cnvs.width / 10);
});

function drawCurve(ctx, points, tension, type = 'stroke') {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    var t = (tension != null) ? tension : 1;
    // console.log(t,points)
    for (var i = 0; i < points.length - 1; i++) {
        var p0 = (i > 0) ? points[i - 1] : points[0];
        var p1 = points[i];
        var p2 = points[i + 1];
        var p3 = (i != points.length - 2) ? points[i + 2] : p2;

        var cp1x = p1.x + (p2.x - p0.x) / 6 * t;
        var cp1y = p1.y + (p2.y - p0.y) / 6 * t;

        var cp2x = p2.x - (p3.x - p1.x) / 6 * t;
        var cp2y = p2.y - (p3.y - p1.y) / 6 * t;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        // console.log(cp1x, cp1y, cp2x, cp2y)
    }
    if (type === 'stroke') {
        ctx.stroke();
    } else {
        ctx.fill();
    }
}

function getScreenPixel(cnvs, rad, it, limit, center, object = false) {
    let height = cnvs.height,
        width = cnvs.width,
        yxRatio = height / width;
    if (object) {
        return {
            x: width / 2 + ((center[0] - it) / limit) * width / 2,
            y: height / 2 + ((center[1] - rad) / limit / yxRatio) * height / 2
        }
    }
    return [width / 2 + ((center[0] - it) / limit) * width / 2, height / 2 + ((center[1] - rad) / limit / yxRatio) * height / 2]
}

function drawArrow(ctx, pixelLocation, length = 30, angle = 0, color = 'rgba(255,255,0,1)', width = 6) {
    let pixelX = pixelLocation[0];
    let pixelY = pixelLocation[1];
    let ct = Math.cos(angle),
        st = Math.sin(angle);
    let rotMat = [
        [ct, -st],
        [st, ct]
    ];
    let arrow = [
        [-0.125 * width / 6, 0],
        [-0.125 * width / 6, -1.5],
        [-0.23 * width / 6, -1.5],
        [0, -2],
        [0.23 * width / 6, -1.5],
        [0.125 * width / 6, -1.5],
        [0.125 * width / 6, 0],
        [0, 0]
    ];
    let transformedArrow = math.dotMultiply(math.transpose(math.multiply(rotMat, math.transpose(arrow))), length / 2);
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.translate(pixelX, pixelY)
    ctx.moveTo(0, 0);
    transformedArrow.forEach((point) => {
        ctx.lineTo(point[0], point[1]);
    });
    ctx.fill();
    // ctx.lineWidth = 8 * length / 80;
    // ctx.stroke();
    // ctx.strokeStyle = color;
    // ctx.lineWidth = 4 * length / 80;
    // ctx.stroke();
    ctx.restore();
}

document.addEventListener('mousedown', (event) => {
  let i = event.offsetX;
  let r = event.offsetY;
  i = axisWidth / 2 - i / cnvs.width * axisWidth;
  r = axisHeight / 2 - r / cnvs.height * axisHeight;
  let vI = Math.random() * .002 - .001;
  let vR = Math.random() * .002 - .001;
  orbit = {
    a: 2 * Math.sqrt(Math.pow(vR / n, 2) + Math.pow(3 * r + 2 * vI / n, 2)),
    xd: 4 * r + 2 * vI / n,
    yd: i - 2 * vR / n,
    b: Math.atan2(vR, 3*n*r + 2*vI),
    hist: []
  }
  // orbits.push({
  // })
  console.log({
    r: -orbit.a / 2 * Math.cos(orbit.b),
    i: orbit.a * Math.sin(orbit.b)
  })
  console.log(orbit)
})