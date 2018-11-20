/*
 * Noel Delgado | @pixelia_me
 */

var items = []
  , point = document.querySelector('svg').createSVGPoint();

function getCoordinates(e, svg) {
  point.x = e.clientX;
  point.y = e.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

function changeColor(e) {
  document.body.className = e.currentTarget.className;
}

function Item(config) {
  Object.keys(config).forEach(function (item) {
    this[item] = config[item];
  }, this);
  this.el.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
  this.el.addEventListener('touchmove', this.touchMoveHandler.bind(this));
}

Item.prototype = {
  update: function update(c) {
    this.clip.setAttribute('cx', c.x);
    this.clip.setAttribute('cy', c.y);
  },
  mouseMoveHandler: function mouseMoveHandler(e) {
    this.update(getCoordinates(e, this.svg));
  },
  touchMoveHandler: function touchMoveHandler(e) {
    e.preventDefault();
    var touch = e.targetTouches[0];
    if (touch) return this.update(getCoordinates(touch, this.svg));
  }
};

[].slice.call(document.querySelectorAll('.item'), 0).forEach(function (item, index) {
  items.push(new Item({
    el: item,
    svg: item.querySelector('svg'),
    clip: document.querySelector('#clip-'+index+' circle'),
  }));
});

[].slice.call(document.querySelectorAll('button'), 0).forEach(function (button) {
  button.addEventListener('click', changeColor);
});

var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

var canvas = document.getElementsByTagName('canvas')[0];
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

var config = {
    TEXTURE_DOWNSAMPLE: 1,
    DENSITY_DISSIPATION: 0.98,
    VELOCITY_DISSIPATION: 0.99,
    PRESSURE_DISSIPATION: 0.8,
    PRESSURE_ITERATIONS: 25,
    CURL: 30,
    SPLAT_RADIUS: 0.005 };


var pointers = [];
var splatStack = [];var _getWebGLContext =

getWebGLContext(canvas),gl = _getWebGLContext.gl,ext = _getWebGLContext.ext;

function getWebGLContext(canvas) {
    var params = { alpha: false, depth: false, stencil: false, antialias: false };

    var gl = canvas.getContext('webgl2', params);
    var isWebGL2 = !!gl;
    if (!isWebGL2)
    gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

    var halfFloat = void 0;
    var supportLinearFiltering = void 0;
    if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    var halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
    var formatRGBA = void 0;
    var formatRG = void 0;
    var formatR = void 0;

    if (isWebGL2)
    {
        formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
    } else

    {
        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    return {
        gl: gl,
        ext: {
            formatRGBA: formatRGBA,
            formatRG: formatRG,
            formatR: formatR,
            halfFloatTexType: halfFloatTexType,
            supportLinearFiltering: supportLinearFiltering } };


}

function getSupportedFormat(gl, internalFormat, format, type)
{
    if (!supportRenderTextureFormat(gl, internalFormat, format, type))
    {
        switch (internalFormat) {

            case gl.R16F:
                return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
            case gl.RG16F:
                return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
            default:
                return null;}

    }

    return {
        internalFormat: internalFormat,
        format: format };

}

function supportRenderTextureFormat(gl, internalFormat, format, type) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE)
    return false;
    return true;
}

function pointerPrototype() {
    this.id = -1;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.down = false;
    this.moved = false;
    this.color = [30, 0, 300];
}

pointers.push(new pointerPrototype());var

GLProgram = function () {
    function GLProgram(vertexShader, fragmentShader) {_classCallCheck(this, GLProgram);
        this.uniforms = {};
        this.program = gl.createProgram();

        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
        throw gl.getProgramInfoLog(this.program);

        var uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (var i = 0; i < uniformCount; i++) {
            var uniformName = gl.getActiveUniform(this.program, i).name;
            this.uniforms[uniformName] = gl.getUniformLocation(this.program, uniformName);
        }
    }_createClass(GLProgram, [{ key: 'bind', value: function bind()

        {
            gl.useProgram(this.program);
        } }]);return GLProgram;}();


function compileShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw gl.getShaderInfoLog(shader);

    return shader;
};

var baseVertexShader = compileShader(gl.VERTEX_SHADER, '\n    precision highp float;\n    precision mediump sampler2D;\n\n    attribute vec2 aPosition;\n    varying vec2 vUv;\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform vec2 texelSize;\n\n    void main () {\n        vUv = aPosition * 0.5 + 0.5;\n        vL = vUv - vec2(texelSize.x, 0.0);\n        vR = vUv + vec2(texelSize.x, 0.0);\n        vT = vUv + vec2(0.0, texelSize.y);\n        vB = vUv - vec2(0.0, texelSize.y);\n        gl_Position = vec4(aPosition, 0.0, 1.0);\n    }\n');





















var clearShader = compileShader(gl.FRAGMENT_SHADER, '\n    precision highp float;\n    precision mediump sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTexture;\n    uniform float value;\n\n    void main () {\n        gl_FragColor = value * texture2D(uTexture, vUv);\n    }\n');












var displayShader = compileShader(gl.FRAGMENT_SHADER, '\n    precision highp float;\n    precision mediump sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTexture;\n\n    void main () {\n        gl_FragColor = texture2D(uTexture, vUv);\n    }\n');











var splatShader = compileShader(gl.FRAGMENT_SHADER, '\n    precision highp float;\n    precision mediump sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uTarget;\n    uniform float aspectRatio;\n    uniform vec3 color;\n    uniform vec2 point;\n    uniform float radius;\n\n    void main () {\n        vec2 p = vUv - point.xy;\n        p.x *= aspectRatio;\n        vec3 splat = exp(-dot(p, p) / radius) * color;\n        vec3 base = texture2D(uTarget, vUv).xyz;\n        gl_FragColor = vec4(base + splat, 1.0);\n    }\n');



















var advectionManualFilteringShader = compileShader(gl.FRAGMENT_SHADER, '\n    precision highp float;\n    precision mediump sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uVelocity;\n    uniform sampler2D uSource;\n    uniform vec2 texelSize;\n    uniform float dt;\n    uniform float dissipation;\n\n    vec4 bilerp (in sampler2D sam, in vec2 p) {\n        vec4 st;\n        st.xy = floor(p - 0.5) + 0.5;\n        st.zw = st.xy + 1.0;\n        vec4 uv = st * texelSize.xyxy;\n        vec4 a = texture2D(sam, uv.xy);\n        vec4 b = texture2D(sam, uv.zy);\n        vec4 c = texture2D(sam, uv.xw);\n        vec4 d = texture2D(sam, uv.zw);\n        vec2 f = p - st.xy;\n        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n    }\n\n    void main () {\n        vec2 coord = gl_FragCoord.xy - dt * texture2D(uVelocity, vUv).xy;\n        gl_FragColor = dissipation * bilerp(uSource, coord);\n        gl_FragColor.a = 1.0;\n    }\n');






























var advectionShader = compileShader(gl.FRAGMENT_SHADER, '\n    precision highp float;\n    precision mediump sampler2D;\n\n    varying vec2 vUv;\n    uniform sampler2D uVelocity;\n    uniform sampler2D uSource;\n    uniform vec2 texelSize;\n    uniform float dt;\n    uniform float dissipation;\n\n    void main () {\n        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;\n        gl_FragColor = dissipation * texture2D(uSource, coord);\n        gl_FragColor.a = 1.0;\n    }\n');

















var divergenceShader = compileShader(gl.FRAGMENT_SHADER, '\n    precision highp float;\n    precision mediump sampler2D;\n\n    varying vec2 vUv;\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform sampler2D uVelocity;\n\n    vec2 sampleVelocity (in vec2 uv) {\n        vec2 multiplier = vec2(1.0, 1.0);\n        if (uv.x < 0.0) { uv.x = 0.0; multiplier.x = -1.0; }\n        if (uv.x > 1.0) { uv.x = 1.0; multiplier.x = -1.0; }\n        if (uv.y < 0.0) { uv.y = 0.0; multiplier.y = -1.0; }\n        if (uv.y > 1.0) { uv.y = 1.0; multiplier.y = -1.0; }\n        return multiplier * texture2D(uVelocity, uv).xy;\n    }\n\n    void main () {\n        float L = sampleVelocity(vL).x;\n        float R = sampleVelocity(vR).x;\n        float T = sampleVelocity(vT).y;\n        float B = sampleVelocity(vB).y;\n        float div = 0.5 * (R - L + T - B);\n        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);\n    }\n');





























var curlShader = compileShader(gl.FRAGMENT_SHADER, '\n    precision highp float;\n    precision mediump sampler2D;\n\n    varying vec2 vUv;\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform sampler2D uVelocity;\n\n    void main () {\n        float L = texture2D(uVelocity, vL).y;\n        float R = texture2D(uVelocity, vR).y;\n        float T = texture2D(uVelocity, vT).x;\n        float B = texture2D(uVelocity, vB).x;\n        float vorticity = R - L - T + B;\n        gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);\n    }\n');




















var vorticityShader = compileShader(gl.FRAGMENT_SHADER, '\n    precision highp float;\n    precision mediump sampler2D;\n\n    varying vec2 vUv;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform sampler2D uVelocity;\n    uniform sampler2D uCurl;\n    uniform float curl;\n    uniform float dt;\n\n    void main () {\n        float T = texture2D(uCurl, vT).x;\n        float B = texture2D(uCurl, vB).x;\n        float C = texture2D(uCurl, vUv).x;\n        vec2 force = vec2(abs(T) - abs(B), 0.0);\n        force *= 1.0 / length(force + 0.00001) * curl * C;\n        vec2 vel = texture2D(uVelocity, vUv).xy;\n        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);\n    }\n');






















var pressureShader = compileShader(gl.FRAGMENT_SHADER, '\n    precision highp float;\n    precision mediump sampler2D;\n\n    varying vec2 vUv;\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform sampler2D uPressure;\n    uniform sampler2D uDivergence;\n\n    vec2 boundary (in vec2 uv) {\n        uv = min(max(uv, 0.0), 1.0);\n        return uv;\n    }\n\n    void main () {\n        float L = texture2D(uPressure, boundary(vL)).x;\n        float R = texture2D(uPressure, boundary(vR)).x;\n        float T = texture2D(uPressure, boundary(vT)).x;\n        float B = texture2D(uPressure, boundary(vB)).x;\n        float C = texture2D(uPressure, vUv).x;\n        float divergence = texture2D(uDivergence, vUv).x;\n        float pressure = (L + R + B + T - divergence) * 0.25;\n        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);\n    }\n');




























var gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, '\n    precision highp float;\n    precision mediump sampler2D;\n\n    varying vec2 vUv;\n    varying vec2 vL;\n    varying vec2 vR;\n    varying vec2 vT;\n    varying vec2 vB;\n    uniform sampler2D uPressure;\n    uniform sampler2D uVelocity;\n\n    vec2 boundary (in vec2 uv) {\n        uv = min(max(uv, 0.0), 1.0);\n        return uv;\n    }\n\n    void main () {\n        float L = texture2D(uPressure, boundary(vL)).x;\n        float R = texture2D(uPressure, boundary(vR)).x;\n        float T = texture2D(uPressure, boundary(vT)).x;\n        float B = texture2D(uPressure, boundary(vB)).x;\n        vec2 velocity = texture2D(uVelocity, vUv).xy;\n        velocity.xy -= vec2(R - L, T - B);\n        gl_FragColor = vec4(velocity, 0.0, 1.0);\n    }\n');



























var textureWidth = void 0;
var textureHeight = void 0;
var density = void 0;
var velocity = void 0;
var divergence = void 0;
var curl = void 0;
var pressure = void 0;
initFramebuffers();

var clearProgram = new GLProgram(baseVertexShader, clearShader);
var displayProgram = new GLProgram(baseVertexShader, displayShader);
var splatProgram = new GLProgram(baseVertexShader, splatShader);
var advectionProgram = new GLProgram(baseVertexShader, ext.supportLinearFiltering ? advectionShader : advectionManualFilteringShader);
var divergenceProgram = new GLProgram(baseVertexShader, divergenceShader);
var curlProgram = new GLProgram(baseVertexShader, curlShader);
var vorticityProgram = new GLProgram(baseVertexShader, vorticityShader);
var pressureProgram = new GLProgram(baseVertexShader, pressureShader);
var gradienSubtractProgram = new GLProgram(baseVertexShader, gradientSubtractShader);

function initFramebuffers() {
    textureWidth = gl.drawingBufferWidth >> config.TEXTURE_DOWNSAMPLE;
    textureHeight = gl.drawingBufferHeight >> config.TEXTURE_DOWNSAMPLE;

    var texType = ext.halfFloatTexType;
    var rgba = ext.formatRGBA;
    var rg = ext.formatRG;
    var r = ext.formatR;

    density = createDoubleFBO(2, textureWidth, textureHeight, rgba.internalFormat, rgba.format, texType, ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
    velocity = createDoubleFBO(0, textureWidth, textureHeight, rg.internalFormat, rg.format, texType, ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
    divergence = createFBO(4, textureWidth, textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);
    curl = createFBO(5, textureWidth, textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);
    pressure = createDoubleFBO(6, textureWidth, textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);
}

function createFBO(texId, w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0 + texId);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return [texture, fbo, texId];
}

function createDoubleFBO(texId, w, h, internalFormat, format, type, param) {
    var fbo1 = createFBO(texId, w, h, internalFormat, format, type, param);
    var fbo2 = createFBO(texId + 1, w, h, internalFormat, format, type, param);

    return {
        get read() {
            return fbo1;
        },
        get write() {
            return fbo2;
        },
        swap: function swap() {
            var temp = fbo1;
            fbo1 = fbo2;
            fbo2 = temp;
        } };

}

var blit = function () {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return function (destination) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
}();

var lastTime = Date.now();
multipleSplats(parseInt(Math.random() * 20) + 5);
update();

function update() {
    resizeCanvas();

    var dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
    lastTime = Date.now();

    gl.viewport(0, 0, textureWidth, textureHeight);

    if (splatStack.length > 0)
    multipleSplats(splatStack.pop());

    advectionProgram.bind();
    gl.uniform2f(advectionProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read[2]);
    gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read[2]);
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write[1]);
    velocity.swap();

    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read[2]);
    gl.uniform1i(advectionProgram.uniforms.uSource, density.read[2]);
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(density.write[1]);
    density.swap();

    for (var i = 0; i < pointers.length; i++) {
        var pointer = pointers[i];
        if (pointer.moved) {
            splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color);
            pointer.moved = false;
        }
    }

    curlProgram.bind();
    gl.uniform2f(curlProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read[2]);
    blit(curl[1]);

    vorticityProgram.bind();
    gl.uniform2f(vorticityProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read[2]);
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl[2]);
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write[1]);
    velocity.swap();

    divergenceProgram.bind();
    gl.uniform2f(divergenceProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read[2]);
    blit(divergence[1]);

    clearProgram.bind();
    var pressureTexId = pressure.read[2];
    gl.activeTexture(gl.TEXTURE0 + pressureTexId);
    gl.bindTexture(gl.TEXTURE_2D, pressure.read[0]);
    gl.uniform1i(clearProgram.uniforms.uTexture, pressureTexId);
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE_DISSIPATION);
    blit(pressure.write[1]);
    pressure.swap();

    pressureProgram.bind();
    gl.uniform2f(pressureProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence[2]);
    pressureTexId = pressure.read[2];
    gl.uniform1i(pressureProgram.uniforms.uPressure, pressureTexId);
    gl.activeTexture(gl.TEXTURE0 + pressureTexId);
    for (var _i = 0; _i < config.PRESSURE_ITERATIONS; _i++) {
        gl.bindTexture(gl.TEXTURE_2D, pressure.read[0]);
        blit(pressure.write[1]);
        pressure.swap();
    }

    gradienSubtractProgram.bind();
    gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
    gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read[2]);
    gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read[2]);
    blit(velocity.write[1]);
    velocity.swap();

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    displayProgram.bind();
    gl.uniform1i(displayProgram.uniforms.uTexture, density.read[2]);
    blit(null);

    requestAnimationFrame(update);
}

function splat(x, y, dx, dy, color) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read[2]);
    gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(splatProgram.uniforms.point, x / canvas.width, 1.0 - y / canvas.height);
    gl.uniform3f(splatProgram.uniforms.color, dx, -dy, 1.0);
    gl.uniform1f(splatProgram.uniforms.radius, config.SPLAT_RADIUS);
    blit(velocity.write[1]);
    velocity.swap();

    gl.uniform1i(splatProgram.uniforms.uTarget, density.read[2]);
    gl.uniform3f(splatProgram.uniforms.color, color[0] * 0.3, color[1] * 0.3, color[2] * 0.3);
    blit(density.write[1]);
    density.swap();
}

function multipleSplats(amount) {
    for (var i = 0; i < amount; i++) {
        var color = [Math.random() * 10, Math.random() * 10, Math.random() * 10];
        var x = canvas.width * Math.random();
        var y = canvas.height * Math.random();
        var dx = 1000 * (Math.random() - 0.5);
        var dy = 1000 * (Math.random() - 0.5);
        splat(x, y, dx, dy, color);
    }
}

function resizeCanvas() {
    if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        initFramebuffers();
    }
}

canvas.addEventListener('mousemove', function (e) {
    pointers[0].moved = pointers[0].down;
    pointers[0].dx = (e.offsetX - pointers[0].x) * 10.0;
    pointers[0].dy = (e.offsetY - pointers[0].y) * 10.0;
    pointers[0].x = e.offsetX;
    pointers[0].y = e.offsetY;
});

canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    var touches = e.targetTouches;
    for (var i = 0; i < touches.length; i++) {
        var pointer = pointers[i];
        pointer.moved = pointer.down;
        pointer.dx = (touches[i].pageX - pointer.x) * 10.0;
        pointer.dy = (touches[i].pageY - pointer.y) * 10.0;
        pointer.x = touches[i].pageX;
        pointer.y = touches[i].pageY;
    }
}, false);

canvas.addEventListener('mousedown', function () {
    pointers[0].down = true;
    pointers[0].color = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];
});

canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    var touches = e.targetTouches;
    for (var i = 0; i < touches.length; i++) {
        if (i >= pointers.length)
        pointers.push(new pointerPrototype());

        pointers[i].id = touches[i].identifier;
        pointers[i].down = true;
        pointers[i].x = touches[i].pageX;
        pointers[i].y = touches[i].pageY;
        pointers[i].color = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];
    }
});

window.addEventListener('mouseup', function () {
    pointers[0].down = false;
});

window.addEventListener('touchend', function (e) {
    var touches = e.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        for (var j = 0; j < pointers.length; j++) {
            if (touches[i].identifier == pointers[j].id)
            pointers[j].down = false;}}
});