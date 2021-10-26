//Abdooul SADIKOU--20158628
uniform vec3 remotePosition;
void main() {
	// HINT: WORK WITH tvChannel HERE

	//Paint it red
	gl_FragColor = vec4(0.8,remotePosition.y,0.7,1);
}