Abdoul Sadikou
20158628

-- Les fonctions translation(x,y,z), rotX(theta), rotY(theta), rotZ(theta) et scale(x,y,z) ont ete definies 

-- les os ont ete ajoutes et respecte le mesh a 95% 

--le robot a ete animer avec une methode de if else ou a chaque second des mouvements cycliques se 
faisait

-- Deux poses comme demandes ont ete ajoutes et peuvent etre trouves a la touche 1 et 2

--L'introduction du maillage s'est deroulee comme suit:
	* J'ai ajouter la formule du linear blend skinning au vertex shader 
	* J'ai utiliser la fonction inverseOf() pour avour l'inverse des anciennes
matrices 
	* Et pour chaque pose et l'animation j'ai fait l'appel de la fonction  buildShaderBoneMatrix
en changeant les boneDict[]
	*probleme: Le maillage ne suit pas mes poses et mon animation. Je pense que j'ai du manquer un truc mais 
que j'arrive pas a trouver 


------------------------------------------
Ca serait bien si pendant votre  |
correction vous me notifier de  | 
mon erreur Merci !!!	                   |
------------------------------------------

