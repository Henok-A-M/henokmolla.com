
import { DEPTH_STRENGTH } from "../config";
import type { CavePair } from "./sequence";
const VS=`attribute vec2 aPosition; varying vec2 vUv; void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
const FS=`precision highp float;uniform sampler2D uColor;uniform sampler2D uDepth;uniform vec2 uPointer;uniform vec2 uStrength;uniform vec2 uCoverScale;varying vec2 vUv;void main(){vec2 uv=(vUv-.5)*uCoverScale+.5;float depth=texture2D(uDepth,uv).r;vec2 displaced=uv+uPointer*uStrength*(depth-.5)*2.;displaced=clamp(displaced,vec2(.008),vec2(.992));gl_FragColor=texture2D(uColor,displaced);}`;
function compile(gl:WebGLRenderingContext,type:number,source:string){
  const shader=gl.createShader(type);if(!shader)throw Error("No WebGL shader");
  gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader)||"Shader compile failed");
  return shader;
}
export function makeProgram(gl:WebGLRenderingContext,vert:string,frag:string){
  const program=gl.createProgram();if(!program)throw Error("No WebGL program");
  const vs=compile(gl,gl.VERTEX_SHADER,vert),fs=compile(gl,gl.FRAGMENT_SHADER,frag);
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||"WebGL link failed");
  return program;
}
export class DepthRenderer{
  readonly canvas:HTMLCanvasElement;
  private gl:WebGLRenderingContext;private program:WebGLProgram;
  private buffer:WebGLBuffer;private color:WebGLTexture;private depth:WebGLTexture;
  private current=-1;
  constructor(canvas:HTMLCanvasElement){
    this.canvas=canvas;
    const gl=canvas.getContext("webgl",{alpha:false,antialias:false,preserveDrawingBuffer:true});
    if(!gl)throw Error("WebGL is unavailable");this.gl=gl;
    const program=makeProgram(gl,VS,FS);this.program=program;
    const buffer=gl.createBuffer(),color=gl.createTexture(),depth=gl.createTexture();
    if(!buffer||!color||!depth)throw Error("WebGL GPU resource failure");
    this.buffer=buffer;this.color=color;this.depth=depth;
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    gl.useProgram(program);const loc=gl.getAttribLocation(program,"aPosition");
    gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    gl.uniform1i(gl.getUniformLocation(program,"uColor"),0);
    gl.uniform1i(gl.getUniformLocation(program,"uDepth"),1);
    gl.uniform2f(gl.getUniformLocation(program,"uStrength"),DEPTH_STRENGTH.x,DEPTH_STRENGTH.y);
  }
  private upload(unit:number,tex:WebGLTexture,img:HTMLImageElement){
    const gl=this.gl;gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
  }
  draw(frame:CavePair|null,pointer:{x:number;y:number}){
    if(!frame)return;
    const gl=this.gl,rect=this.canvas.getBoundingClientRect();
    if(rect.width<1||rect.height<1)return;
    const ratio=Math.min(window.devicePixelRatio||1,2);
    const w=Math.max(1,Math.round(rect.width*ratio)),h=Math.max(1,Math.round(rect.height*ratio));
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
    gl.viewport(0,0,w,h);gl.useProgram(this.program);
    if(frame.index!==this.current){this.upload(0,this.color,frame.color);this.upload(1,this.depth,frame.depth);this.current=frame.index;}
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.color);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.depth);
    const view=w/h,image=1920/1080;
    gl.uniform2f(gl.getUniformLocation(this.program,"uCoverScale"),view>image?1:view/image,view>image?image/view:1);
    gl.uniform2f(gl.getUniformLocation(this.program,"uPointer"),pointer.x,pointer.y);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  destroy(){const gl=this.gl;gl.deleteTexture(this.color);gl.deleteTexture(this.depth);gl.deleteBuffer(this.buffer);gl.deleteProgram(this.program);gl.getExtension("WEBGL_lose_context")?.loseContext();}
}
