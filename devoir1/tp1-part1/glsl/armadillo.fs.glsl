// Create shared variable. The value is given as the interpolation between normals computed in the vertex shader
in vec3 interpolatedNormal;
uniform sampler2D fft;
uniform vec3 remotePosition1;
uniform vec3 remotePosition2;
/* HINT: YOU WILL NEED A DIFFERENT SHARED VARIABLE TO COLOR ACCORDING TO POSITION OF REMOTE */

void main() {

  float fft_middle = texture(fft, vec2(0.25, 0.0)).x;
  float fft_treble = texture(fft, vec2(0.5, 0.0)).x;
  // Set final rendered color according to the surface normal
  gl_FragColor = vec4(normalize(interpolatedNormal).x+fft_treble*remotePosition1.y, normalize(interpolatedNormal).y+fft_middle*remotePosition2.y,
  normalize(interpolatedNormal).z, 1.0);
}
