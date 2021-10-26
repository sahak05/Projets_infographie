//Abdooul SADIKOU--20158628

// Create shared variable for the vertex and fragment shaders
out vec3 interpolatedNormal;
uniform float time;
uniform sampler2D fft;
uniform vec3 remotePosition;
uniform vec3 remotePosition1;

void main() {
    // Set shared variable to vertex normal
    interpolatedNormal = normal;

	// Get components of sounds from the FFT texture
	float fft_bass = texture(fft, vec2(0.1, 0.0)).x;
	float fft_middle = texture(fft, vec2(0.25, 0.0)).x;
	float fft_treble = texture(fft, vec2(0.5, 0.0)).x;
	
	// HINT: Work with tvChannel, fft and normal here to perturb the armadillo's geometry. 
	// You can use time as a seed for pseudo-random number generators.
	// By default, we simply multiply each vertex by the model-view matrix and the projection matrix to get final vertex position
	//deformation 1
	vec3 deform1 = (remotePosition.y*fft_bass*fft_middle*interpolatedNormal);
	//deformation 2 ---pas vraiment convaicant mais juste une deformation en fonction des
	//fft_basses mais qui touche juste le haut de l'armadillio
	vec3 deform2 = remotePosition1.y*(fft_bass*position.y)*interpolatedNormal;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(deform1+deform2+position, 1.0);
}

