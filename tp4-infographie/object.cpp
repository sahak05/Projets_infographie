#include "object.hpp"

#include <cmath>
#include <cfloat>
#include <fstream>
#include <sstream>
#include <map>
#include <vector>
#include <iostream>
#include <algorithm>


bool Object::intersect(Ray ray, Intersection &hit) const 
{
    // Assure une valeur correcte pour la coordonnée W de l'origine et de la direction
	// Vous pouvez commentez ces lignes si vous faites très attention à la façon de construire vos rayons.
    ray.origin[3] = 1;
    ray.direction[3] = 0;

    Ray local_ray(i_transform * ray.origin, i_transform * ray.direction);
	//!!! NOTE UTILE : pour calculer la profondeur dans localIntersect(), si l'intersection se passe à
	// ray.origin + ray.direction * t, alors t est la profondeur
	//!!! NOTE UTILE : ici, la direction peut êytre mise à l'échelle, alors vous devez la renormaliser
	// dans localIntersect(), ou vous aurez une profondeur dans le système de coordonnées local, qui
	// ne pourra pas être comparée aux intersection avec les autres objets.
    if (localIntersect(local_ray, hit)) 
	{
        // Assure la valeur correcte de W.
        hit.position[3] = 1;
        hit.normal[3] = 0;
        
		// Transforme les coordonnées de l'intersection dans le repère global.
        hit.position = transform * hit.position;
        hit.normal = (n_transform * hit.normal).normalized();
        
		return true;
    }

    return false;
}


bool Sphere::localIntersect(Ray const &ray, Intersection &hit) const 
{
    // @@@@@@ VOTRE CODE ICI
	// Vous pourriez aussi utiliser des relations géométriques pures plutôt que les
	// outils analytiques présentés dans les slides.
	// Ici, dans le système de coordonées local, la sphère est centrée en (0, 0, 0)
	//
	// NOTE : hit.depth est la profondeur de l'intersection actuellement la plus proche,
	// donc n'acceptez pas les intersections qui occurent plus loin que cette valeur.
	
	double b = ray.origin.dot(ray.direction) * 2;
	double a = ray.direction.dot(ray.direction);
	double c = (ray.origin.dot(ray.origin)) - (radius * radius);

	double discriminant =  b*b - (4 * a * c);

	bool pos = false;

	if (discriminant < 0.00001 && discriminant > -0.00001) { // ==0

		float t = (- b) / (2.0 * a);
		
		Vector p = ray.origin + t * ray.direction;
		if (t>0 && hit.depth > t) {
			hit.depth = t;
			hit.normal = p.normalized();
			hit.position = p;
			pos = true;
			//return true;
		}
	
		return pos;
	}
	else if(discriminant>0) {
		double t1 =  (- b + sqrt(discriminant)) / (2.0 * a);

		double t2 = (-b - sqrt(discriminant)) / (2.0 * a);
		double t3 = 0.0;
		if (t1 > 0 && t2 > 0) {  t3 = std::min(t1, t2); }

		else if (t1 < 0 && t2>0) {  t3 = t2; }

		else if (t1 > 0 && t2 < 0) {  t3 = t1; }

		//if (t3 < 0.0) { return false; }

		Vector p = ray.origin + t3 * ray.direction;
		
		if (t3>0 && hit.depth > t3){
			hit.depth = t3;
			hit.normal = p.normalized();
			hit.position = p;
			pos = true;
			//return true;
		}
		return pos;
	}
	return pos;
	//return false;
}


bool Plane::localIntersect(Ray const &ray, Intersection &hit) const
{
	// @@@@@@ VOTRE CODE ICI
	// N'acceptez pas les intersections tant que le rayon est à l'intérieur du plan.
	// ici, dans le système de coordonées local, le plan est à z = 0.
	//
	// NOTE : hit.depth est la profondeur de l'intersection actuellement la plus proche,
	// donc n'acceptez pas les intersections qui occurent plus loin que cette valeur.
	Vector rayon = ray.direction-ray.origin;//.normalized();//
	Vector normalPlan = { 0.0,0.0,1.0 };
	double scal = rayon.dot(normalPlan);
	if (scal > -0.00001 && scal <	0.00001) {//veut dire plan et rayon meme direction
		return false;
	}
	//le parametre t avec z=0 // les coordonees en z de lequation parametrique
	double t=-ray.origin[2]/ray.direction[2];
	//coordones du point secant
	Vector pointS = ray.origin + t * ray.direction;
	if (hit.depth >t && t > 0.001) {
		hit.depth = t;
		hit.position = pointS;
		hit.normal = pointS.normalized();
		return true;
	}
	
    return false;
}


bool Conic::localIntersect(Ray const &ray, Intersection &hit) const {
    // @@@@@@ VOTRE CODE ICI (licence créative)
	Vector origin = ray.origin;
	Vector direction = ray.direction;
    return false;
}


// Intersections !
bool Mesh::localIntersect(Ray const &ray, Intersection &hit) const
{
	// Test de la boite englobante
	double tNear = -DBL_MAX, tFar = DBL_MAX;
	for (int i = 0; i < 3; i++) {
		if (ray.direction[i] == 0.0) {
			if (ray.origin[i] < bboxMin[i] || ray.origin[i] > bboxMax[i]) {
				// Rayon parallèle à un plan de la boite englobante et en dehors de la boite
				return false;
			}
			// Rayon parallèle à un plan de la boite et dans la boite: on continue
		}
		else {
			double t1 = (bboxMin[i] - ray.origin[i]) / ray.direction[i];
			double t2 = (bboxMax[i] - ray.origin[i]) / ray.direction[i];
			if (t1 > t2) std::swap(t1, t2); // Assure t1 <= t2

			if (t1 > tNear) tNear = t1; // On veut le plus lointain tNear.
			if (t2 < tFar) tFar = t2; // On veut le plus proche tFar.

			if (tNear > tFar) return false; // Le rayon rate la boite englobante.
			if (tFar < 0) return false; // La boite englobante est derrière le rayon.
		}
	}
	// Si on arrive jusqu'ici, c'est que le rayon a intersecté la boite englobante.

	// Le rayon interesecte la boite englobante, donc on teste chaque triangle.
	bool isHit = false;
	for (size_t tri_i = 0; tri_i < triangles.size(); tri_i++) {
		Triangle const &tri = triangles[tri_i];

		if (intersectTriangle(ray, tri, hit)) {
			isHit = true;
		}
	}
	return isHit;
}

double Mesh::implicitLineEquation(double p_x, double p_y,
	double e1_x, double e1_y,
	double e2_x, double e2_y) const
{
	return (e2_y - e1_y)*(p_x - e1_x) - (e2_x - e1_x)*(p_y - e1_y);
}

bool Mesh::intersectTriangle(Ray const &ray,
	Triangle const &tri,
	Intersection &hit) const
{
	// Extrait chaque position de sommet des données du maillage.
	Vector const &p0 = positions[tri[0].pi];
	Vector const &p1 = positions[tri[1].pi];
	Vector const &p2 = positions[tri[2].pi];

	//normale du triangle 
	Vector p1p2 = p2 - p1;
	Vector p2p0 = p0 - p2;
	Vector p0p2 = p2 - p0;
	Vector p0p1 = p1 - p0;	
	Vector normal = p1p2.cross(p0-p1);
	//normal.normalize(); //a revoir 
	//composant D de l'equation
	double d = -1*(normal.dot(p0));

	double t = (-d - normal.dot(ray.origin)) / (normal.dot(ray.direction));

	if (t < 0.0001) {
		return false;
	}
	//Composants du vecteur P intersection
	Vector p = ray.origin + t * ray.direction;

	Vector p0p = p - p0;
	Vector p1p = p - p1;
	Vector p2p = p - p2;

	//produits vectoriel chaque sommets 
	Vector p0V = p0p1.cross(p0p);
	Vector p1V = p1p2.cross(p1p);
	Vector p2V = p2p0.cross(p2p);

	if ((p0V.dot(p1V) > 0 && p0V.dot(p2V) > 0 && p1V.dot(p2V) > 0) ||
		(p0V.dot(p1V) < 0 && p0V.dot(p2V) < 0 && p1V.dot(p2V) < 0)) {
		if (hit.depth > t) {
			hit.depth = t;
			hit.position = p;
			hit.normal = normal.normalized();// p.normalized();
			return true;
		}
	}
	return false;
	// @@@@@@ VOTRE CODE ICI
	// Décidez si le rayon intersecte le triangle (p0,p1,p2).
	// Si c'est le cas, remplissez la structure hit avec les informations
	// de l'intersection et renvoyez true.
	// Vous pourriez trouver utile d'utiliser la routine implicitLineEquation()
	// pour calculer le résultat de l'équation de ligne implicite en 2D.
	//
	// NOTE : hit.depth est la profondeur de l'intersection actuellement la plus proche,
	// donc n'acceptez pas les intersections qui occurent plus loin que cette valeur.
	//!!! NOTE UTILE : pour le point d'intersection, sa normale doit satisfaire hit.normal.dot(ray.direction) < 0

	
}
