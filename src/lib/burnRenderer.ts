
import { makeProgram } from "./depthRenderer";
const VS=`attribute vec2 aPosition; varying vec2 vUv; void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}`;
const FS=`
precision highp float;varying vec2 vUv;uniform vec2 uResolution;uniform float uProgress;uniform float uTime;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(13.7,8.4);a*=.5;}return v;}
void main(){vec2 uv=vUv;vec2 p=uv-.5;p.x*=uResolution.x/uResolution.y;
float n=fbm(uv*3.1+vec2(uTime*.035,-uTime*.025));
float detail=fbm(uv*8.4-vec2(uTime*.02));
float field=length(p)+(n-.5)*.24+(detail-.5)*.065;
float reach=max(1.02,1.02*length(vec2(.5*uResolution.x/uResolution.y,.5))/.9434)+.06;
float threshold=mix(-.22,reach,uProgress);float edge=.045;
float alpha=smoothstep(threshold-edge,threshold+edge,field);
float rim=1.-smoothstep(.006,.052,abs(field-threshold));
float coverage=max(alpha,rim*.18);
vec3 blue=vec3(96.,154.,202.)/255.;vec3 color=mix(blue,vec3(1.),rim*.68);
gl_FragColor=vec4(color*coverage,coverage);
}`;
export class BurnRenderer{
  readonly canvas:HTMLCanvasElement;private gl:WebGLRenderingContext;private program:WebGLProgram;private buffer:WebGLBuffer;
  constructor(canvas:HTMLCanvasElement){
    this.canvas=canvas;
    const gl=canvas.getContext("webgl",{alpha:true,antialias:false,premultipliedAlpha:true});
    if(!gl)throw Error("Preloader WebGL unavailable");this.gl=gl;
    const program=makeProgram(gl,VS,FS);this.program=program;const buffer=gl.createBuffer();if(!buffer)throw Error("No WebGL buffer");this.buffer=buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    gl.useProgram(program);const loc=gl.getAttribLocation(program,"aPosition");gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  }
  draw(progress:number,time:number){
    const gl=this.gl,r=this.canvas.getBoundingClientRect();if(r.width<1||r.height<1)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
    gl.viewport(0,0,w,h);gl.useProgram(this.program);
    gl.uniform2f(gl.getUniformLocation(this.program,"uResolution"),w,h);
    gl.uniform1f(gl.getUniformLocation(this.program,"uProgress"),progress);
    gl.uniform1f(gl.getUniformLocation(this.program,"uTime"),time/1000);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  destroy(){const gl=this.gl;gl.deleteBuffer(this.buffer);gl.deleteProgram(this.program);gl.getExtension("WEBGL_lose_context")?.loseContext();}
}
