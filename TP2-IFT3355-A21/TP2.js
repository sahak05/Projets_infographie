/**
*	[NOM] Sadikou
*	[PRÉNOM] Abdoul
*	[MATRICULE]  20158628
*/

import * as THREE from './build/three.module.js';

import Stats from './jsm/libs/stats.module.js';

import {ColladaLoader} from './jsm/loaders/ColladaLoader.js';

import {OrbitControls} from './jsm/controls/OrbitControls.js'

//SPECIAL IMPORT
// THREEx.KeyboardState.js keep the current state of the keyboard.
// It is possible to query it at any time. No need of an event.
// This is particularly convenient in loop driven case, like in
// 3D demos or games.
//
// # Usage
//
// **Step 1**: Create the object
//
// ```var keyboard	= new THREEx.KeyboardState();```
//
// **Step 2**: Query the keyboard state
//
// This will return true if shift and A are pressed, false otherwise
//
// ```keyboard.pressed("shift+A")```
//
// **Step 3**: Stop listening to the keyboard
//
// ```keyboard.destroy()```
//
// NOTE: this library may be nice as standaline. independant from three.js
// - rename it keyboardForGame
//
// # Code
//

/** @namespace */
var THREEx = THREEx || {};

/**
 * - NOTE: it would be quite easy to push event-driven too
 *   - microevent.js for events handling
 *   - in this._onkeyChange, generate a string from the DOM event
 *   - use this as event name
 */
THREEx.KeyboardState = function (domElement) {
    this.domElement = domElement || document;
    // to store the current state
    this.keyCodes = {};
    this.modifiers = {};

    // create callback to bind/unbind keyboard events
    var _this = this;
    this._onKeyDown = function (event) {
        _this._onKeyChange(event)
    }
    this._onKeyUp = function (event) {
        _this._onKeyChange(event)
    }

    // bind keyEvents
    this.domElement.addEventListener("keydown", this._onKeyDown, false);
    this.domElement.addEventListener("keyup", this._onKeyUp, false);

    // create callback to bind/unbind window blur event
    this._onBlur = function () {
        for (var prop in _this.keyCodes)
            _this.keyCodes[prop] = false;
        for (var prop in _this.modifiers)
            _this.modifiers[prop] = false;
    }

    // bind window blur
    window.addEventListener("blur", this._onBlur, false);
}

/**
 * To stop listening of the keyboard events
 */
THREEx.KeyboardState.prototype.destroy = function () {
    // unbind keyEvents
    this.domElement.removeEventListener("keydown", this._onKeyDown, false);
    this.domElement.removeEventListener("keyup", this._onKeyUp, false);

    // unbind window blur event
    window.removeEventListener("blur", this._onBlur, false);
}

THREEx.KeyboardState.MODIFIERS = ['shift', 'ctrl', 'alt', 'meta'];
THREEx.KeyboardState.ALIAS = {
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40,
    'space': 32,
    'pageup': 33,
    'pagedown': 34,
    'tab': 9,
    'escape': 27
};

/**
 * to process the keyboard dom event
 */
THREEx.KeyboardState.prototype._onKeyChange = function (event) {
    // log to debug
    //console.log("onKeyChange", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)

    // update this.keyCodes
    var keyCode = event.keyCode
        var pressed = event.type === 'keydown' ? true : false
        this.keyCodes[keyCode] = pressed
        // update this.modifiers
        this.modifiers['shift'] = event.shiftKey
        this.modifiers['ctrl'] = event.ctrlKey
        this.modifiers['alt'] = event.altKey
        this.modifiers['meta'] = event.metaKey
}

/**
 * query keyboard state to know if a key is pressed of not
 *
 * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
 * @returns {Boolean} true if the key is pressed, false otherwise
 */
THREEx.KeyboardState.prototype.pressed = function (keyDesc) {
    var keys = keyDesc.split("+");
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
            var pressed = false
            if (THREEx.KeyboardState.MODIFIERS.indexOf(key) !== -1) {
                pressed = this.modifiers[key];
            } else if (Object.keys(THREEx.KeyboardState.ALIAS).indexOf(key) != -1) {
                pressed = this.keyCodes[THREEx.KeyboardState.ALIAS[key]];
            } else {
                pressed = this.keyCodes[key.toUpperCase().charCodeAt(0)]
            }
            if (!pressed)
                return false;
    };
    return true;
}

/**
 * return true if an event match a keyDesc
 * @param  {KeyboardEvent} event   keyboard event
 * @param  {String} keyDesc string description of the key
 * @return {Boolean}         true if the event match keyDesc, false otherwise
 */
THREEx.KeyboardState.prototype.eventMatches = function (event, keyDesc) {
    var aliases = THREEx.KeyboardState.ALIAS
        var aliasKeys = Object.keys(aliases)
        var keys = keyDesc.split("+")
        // log to debug
        // console.log("eventMatches", event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey)
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var pressed = false;
            if (key === 'shift') {
                pressed = (event.shiftKey ? true : false)
            } else if (key === 'ctrl') {
                pressed = (event.ctrlKey ? true : false)
            } else if (key === 'alt') {
                pressed = (event.altKey ? true : false)
            } else if (key === 'meta') {
                pressed = (event.metaKey ? true : false)
            } else if (aliasKeys.indexOf(key) !== -1) {
                pressed = (event.keyCode === aliases[key] ? true : false);
            } else if (event.keyCode === key.toUpperCase().charCodeAt(0)) {
                pressed = true;
            }
            if (!pressed)
                return false;
        }
        return true;
}

let container, stats, clock, controls;
let lights, camera, scene, renderer, human, humanGeometry, humanMaterial, humanMesh, robot;
let skinWeight, skinIndices, boneArray, realBones, boneDict, centerOfMass;

THREE.Cache.enabled = true;


THREE.Object3D.prototype.setMatrix = function (a) {
    this.matrix = a;
    this.matrix.decompose(this.position, this.quaternion, this.scale);
};


class Robot {
    constructor(h) {
this.spineLength = 0.65305 ;
		this.chestLength =0.46487;
		this.neckLength = 0.24523
		this.headLength = 0.39284;
		
		this.armLength = 0.72111;
		this.forearmLength = 0.61242;
		this.legLength = 1.16245;
		this.shinLength = 1.03432;
		
		this.armLeftRotation = realBones[4].rotation;
		this.forearmLeftRotation = realBones[5].rotation;
		this.armRightRotation  = realBones[6].rotation;
		this.forearmRightRotation = realBones[7].rotation;
		
		this.legLeftRotation = realBones[8].rotation;
		this.shinLeftRotation = realBones[9].rotation;
		this.legRightRotation = realBones[10].rotation;
		this.shinRightRotation = realBones[11].rotation;
		
		this.spineTranslation = realBones[0].position;
		this.chestTranslation = realBones[1].position;
		this.neckTranslation = realBones[2].position;
		this.headTranslation = realBones[3].position;
		this.armLeftTranslation = realBones[4].position;
		this.forearmLeftTranslation =  realBones[5].position;
		this.armRightTranslation  = realBones[6].position;
		this.forearmRightTranslation = realBones[7].position;
		
		this.legLeftTranslation =  realBones[8].position;
		this.shinLeftTranslation =  realBones[9].position;
		this.legRightTranslation=  realBones[10].position;
		this.shinRightTranslation =  realBones[11].position;
		
		
        this.bodyWidth = 0.2;
        this.bodyDepth = 0.2;

      
        this.neckRadius = 0.1;

        this.headRadius = 0.32;


        this.legRadius = 0.10;
        this.thighRadius = 0.1;
        this.footDepth = 0.4;
        this.footWidth = 0.25;

        this.armRadius = 0.10;

        this.handRadius = 0.1;

        // Material
        this.material = new THREE.MeshNormalMaterial();
        this.human = h;
        // Initial pose
        this.initialize()
    }

    initialize() {
        // leg Left geomerty
        var legLeftGeometry = new THREE.CylinderGeometry(0.5*this.legRadius , this.legRadius ,this.legLength, 64);
        if (!this.hasOwnProperty("leg_L"))
            this.legL = new THREE.Mesh(legLeftGeometry, this.material);

        // leg Left geomerty
        var legRightGeometry = new THREE.CylinderGeometry(0.5*this.legRadius, this.legRadius ,this.legLength, 64);
        if (!this.hasOwnProperty("leg_R"))
            this.legR = new THREE.Mesh(legRightGeometry, this.material);

        // shin Left geomerty
        var leftShinGeometry = new THREE.CylinderGeometry(0.5*this.legRadius , this.legRadius,this.legLength, 64);
        if (!this.hasOwnProperty("Shin_L"))
            this.shinL = new THREE.Mesh(leftShinGeometry, this.material);

        // shin Right geomerty
        var rightShinGeometry = new THREE.CylinderGeometry(0.5*this.legRadius , this.legRadius ,this.legLength, 64);
        if (!this.hasOwnProperty("Shin_R"))
            this.shinR = new THREE.Mesh(rightShinGeometry, this.material);


        // Spine geomerty
        var spineGeometry = new THREE.CylinderGeometry(0.5*this.bodyWidth / 2, this.bodyWidth / 2,this.spineLength, 64);
        if (!this.hasOwnProperty("spine"))
            this.spine = new THREE.Mesh(spineGeometry, this.material);
		
		var chestGeometry = new THREE.CylinderGeometry(0.5*this.bodyWidth / 2, this.bodyWidth/2, this.chestLength, 64);
		 if (!this.hasOwnProperty("chest"))
            this.chest = new THREE.Mesh(chestGeometry, this.material);

        //armL geometry
         var armLGeometry = new THREE.CylinderGeometry(0.5*this.armRadius /2, this.armRadius, this.armLength, 64);
        if (!this.hasOwnProperty("Arm_L"))
            this.armL = new THREE.Mesh(armLGeometry, this.material);

        //arm R geometry
        var armRGeometry = new THREE.CylinderGeometry(0.5*this.armRadius / 2, this.armRadius, this.armLength, 64);
        if (!this.hasOwnProperty("Arm_R"))
            this.armR = new THREE.Mesh(armRGeometry, this.material);

        //forearm R geometry
        var forearmRGeometry = new THREE.CylinderGeometry( 0.5*this.armRadius/2 ,0.75*this.armRadius , this.armLength, 64);
        if (!this.hasOwnProperty("Forearm_R"))
            this.forearmR = new THREE.Mesh(forearmRGeometry, this.material);

        //forearm L geometry
        var forearmLGeometry = new THREE.CylinderGeometry(0.5*this.armRadius/2 ,0.75*this.armRadius , this.armLength, 64);
        if (!this.hasOwnProperty("Forearm_L"))
            this.forearmL = new THREE.Mesh(forearmLGeometry, this.material);

        //hand L geometry
        var handLGeometry = new THREE.SphereGeometry(this.handRadius,64 , 3);
        if (!this.hasOwnProperty("Hand_L"))
            this.handL = new THREE.Mesh(handLGeometry, this.material);


        //hand R geometry
        var handRGeometry = new THREE.SphereGeometry(this.handRadius,64 , 3);
        if (!this.hasOwnProperty("Hand_R"))
            this.handR = new THREE.Mesh(handRGeometry, this.material);

        // Neck geometry
        var neckGeometry = new THREE.CylinderGeometry(0.5*this.neckRadius, this.neckRadius, this.neckLength, 64);
        if (!this.hasOwnProperty("neck"))
            this.neck = new THREE.Mesh(neckGeometry, this.material);

        // Head geometry
        var headGeometry = new THREE.SphereGeometry(this.headLength/2, 64, 3);
        if (!this.hasOwnProperty("head"))
            this.head = new THREE.Mesh(headGeometry, this.material);


        // footL geometry
        var footLGeometry = new THREE.BoxGeometry(this.footWidth, 0.17, 0.8*this.footDepth);
        if (!this.hasOwnProperty("foot_L"))
            this.footL = new THREE.Mesh(footLGeometry, this.material);


        // footR geometry
        var footRGeometry = new THREE.BoxGeometry(this.footWidth, 0.17, .8*this.footDepth);
        if (!this.hasOwnProperty("foot_R"))
            this.footR = new THREE.Mesh(footRGeometry, this.material);

        // Spine matrix
        this.spineMatrix = new THREE.Matrix4().set(

                1, 0, 0, 0,
                0, 1, 0, this.spineTranslation.y+this.spineLength/2,
                0, 0, 1, 0,
                0, 0, 0, 1);

        //leg left matrix
        this.leftLegMatrix = new THREE.Matrix4().set(

            1, 0, 0, this.legLeftTranslation.x,
            0, 1, 0,   this.legLeftTranslation.y-this.spineLength/4,
            0, 0, 1, this.legLeftTranslation.z,
            0, 0, 0, 1);
        let inter1 = new THREE.Matrix4().multiplyMatrices(this.leftLegMatrix,rotZ(this.legLeftRotation.z));
        var lLegMatrix =  new THREE.Matrix4().multiplyMatrices(inter1,this.spineMatrix);


        //shin left matrix
        this.shinLeftMatrix = new THREE.Matrix4().set(

            1, 0, 0,  this.shinLeftTranslation.x,
            0, 1, 0,   this.shinLeftTranslation.y,
            0, 0, 1, this.shinLeftTranslation.z,
            0, 0, 0, 1);
        let inter5 = matMul(this.shinLeftMatrix,rotZ(this.shinLeftRotation.z));
        var shinLeftMatrix =  new THREE.Matrix4().multiplyMatrices(lLegMatrix,inter5);

        //leg right matrix
        this.rightLegMatrix = new THREE.Matrix4().set(

            1,0, 0, this.legRightTranslation.x,
            0, 1, 0,   this.legRightTranslation.y-this.spineLength/4,
            0, 0, 1, this.legRightTranslation.z,
            0, 0, 0, 1);
        let inter = new THREE.Matrix4().multiplyMatrices(this.rightLegMatrix,rotZ(this.legRightRotation.z));

        var rLegMatrix =  new THREE.Matrix4().multiplyMatrices(inter,this.spineMatrix);

        //shin right matrix
        this.shinRightMatrix = new THREE.Matrix4().set(

            1, 0, 0,  this.shinRightTranslation.x,
            0, 1, 0,   this.shinRightTranslation.y,
            0, 0, 1, this.shinRightTranslation.z,
            0, 0, 0, 1);
        let inter6 = new THREE.Matrix4().multiplyMatrices(this.shinRightMatrix,rotZ(this.shinRightRotation.z));

        var shinRightMatrix =  new THREE.Matrix4().multiplyMatrices(rLegMatrix,inter6);


        this.chestMatrix = new THREE.Matrix4().set(

                1, 0, 0, 0,
                0, 1, 0, this.chestTranslation.y-this.spineLength/2+this.chestLength/2,
                0, 0, 1, 0,
                0, 0, 0, 1);
		var chestMatrix =  new THREE.Matrix4().multiplyMatrices(this.spineMatrix, this.chestMatrix);


        //arm Left Matrix
        this.armLMatrix = new THREE.Matrix4().set(

            1, 0, 0, this.armLeftTranslation.x+this.neckLength,
            0, 1, 0, this.armLeftTranslation.y-this.neckLength-this.chestLength/3,
            0, 0, 1, this.armLeftTranslation.z,
            0, 0, 0, 1);
        const inter2 = new THREE.Matrix4().multiplyMatrices(this.armLMatrix,rotZ(this.armLeftRotation.z));
        var armLMatrix =  new THREE.Matrix4().multiplyMatrices(chestMatrix,inter2);


        //arm Right Matrix
        this.armRMatrix = new THREE.Matrix4().set(

            1, 0, 0, this.armRightTranslation.x-this.neckLength,
            0, 1, 0, this.armRightTranslation.y-this.neckLength-this.chestLength/3,
            0, 0, 1, this.armRightTranslation.z,
            0, 0, 0, 1);
        const inter3 = matMul(this.armRMatrix,rotZ(this.armRightRotation.z));
        var armRMatrix =  matMul(chestMatrix,inter3);


        //forearm Right Matrix
        this.forearmRMatrix = new THREE.Matrix4().set(

            1, 0, 0, this.forearmRightTranslation.x,
            0, 1, 0, this.forearmRightTranslation.y,
            0, 0, 1, this.forearmRightTranslation.z,
            0, 0, 0, 1);
        const inter7 = matMul(this.forearmRMatrix,rotZ(this.forearmRightRotation.z));
        var forearmRMatrix =  new THREE.Matrix4().multiplyMatrices(armRMatrix,inter7 );


        //forearm Left Matrix
        this.forearmLMatrix = new THREE.Matrix4().set(

            1, 0, 0, this.forearmLeftTranslation.x,
            0, 1, 0, this.forearmLeftTranslation.y,
            0, 0, 1, this.forearmLeftTranslation.z,
            0, 0, 0, 1);
        const inter8 = new THREE.Matrix4().multiplyMatrices(this.forearmLMatrix,rotZ(this.forearmLeftRotation.z));
        var forearmLMatrix =  new THREE.Matrix4().multiplyMatrices(armLMatrix,inter8 );


        //hand Left Matrix
        this.handLMatrix = new THREE.Matrix4().set(

            1, 0, 0, 0,
            0, 1, 0, this.forearmLength-this.headLength/2,
            0, 0, 1, 0,
            0, 0, 0, 1);
        var handLMatrix =  new THREE.Matrix4().multiplyMatrices(forearmLMatrix,this.handLMatrix );


        //hand Left Matrix
        this.handRMatrix = new THREE.Matrix4().set(

            1, 0, 0, 0,
            0, 1, 0, this.forearmLength-this.headLength/2,
            0, 0, 1, 0,
            0, 0, 0, 1);
        var handRMatrix =  new THREE.Matrix4().multiplyMatrices(forearmRMatrix,this.handRMatrix );

        // Neck matrix
        this.neckMatrix = new THREE.Matrix4().set(
                1, 0, 0, 0,
                0, 1, 0, this.neckTranslation.y-this.chestLength/2+this.neckLength/2,
                0, 0, 1, 0,
                0, 0, 0, 1);
        var neckMatrix = new THREE.Matrix4().multiplyMatrices(chestMatrix, this.neckMatrix);


        // Head matrix
        this.headMatrix = new THREE.Matrix4().set(
                1, 0, 0, 0,
                0, 1, 0, this.headTranslation.y-this.neckLength/2+this.headLength/2,
                0, 0, 1, 0,
                0, 0, 0, 1);
        var headMatrix = new THREE.Matrix4().multiplyMatrices(neckMatrix, this.headMatrix);


        // footL matrix
        this.footLMatrix = new THREE.Matrix4().set(
            1, 0, 0, 0,
            0, 1, 0, 0.5*this.shinLength,
            0, 0, 1, 0,
            0, 0, 0, 1);
        var footLMatrix = new THREE.Matrix4().multiplyMatrices(shinLeftMatrix, this.footLMatrix);


        // footR matrix
        this.footRMatrix = new THREE.Matrix4().set(
            1, 0, 0, 0,
            0, 1, 0, 0.5*this.shinLength,
            0, 0, 1, 0,
            0, 0, 0, 1);
        var footRMatrix = new THREE.Matrix4().multiplyMatrices(shinRightMatrix, this.footRMatrix);

        // Apply transformation
        this.spine.setMatrix(this.spineMatrix);

        if (scene.getObjectById(this.spine.id) === undefined)
            scene.add(this.spine);
		
		this.chest.setMatrix(chestMatrix);

        if (scene.getObjectById(this.chest.id) === undefined)
            scene.add(this.chest);

        this.neck.setMatrix(neckMatrix);
        if (scene.getObjectById(this.neck.id) === undefined)
            scene.add(this.neck);

        this.head.setMatrix(headMatrix);
        if (scene.getObjectById(this.head.id) === undefined)
            scene.add(this.head);

        this.legL.setMatrix(lLegMatrix);

        if (scene.getObjectById(this.legL.id) === undefined)
            scene.add(this.legL);

        this.shinL.setMatrix(shinLeftMatrix);

        if (scene.getObjectById(this.shinL.id) === undefined)
            scene.add(this.shinL);

        this.legR.setMatrix(rLegMatrix);

        if (scene.getObjectById(this.legR.id) === undefined)
            scene.add(this.legR);

        this.shinR.setMatrix(shinRightMatrix);

        if (scene.getObjectById(this.shinR.id) === undefined)
            scene.add(this.shinR);

        this.armL.setMatrix(armLMatrix);

        if (scene.getObjectById(this.armL.id) === undefined)
            scene.add(this.armL);

        this.armR.setMatrix(armRMatrix);

        if (scene.getObjectById(this.armR.id) === undefined)
            scene.add(this.armR);

        this.forearmR.setMatrix(forearmRMatrix);

        if (scene.getObjectById(this.forearmR.id) === undefined)
            scene.add(this.forearmR);

        this.forearmL.setMatrix(forearmLMatrix);

        if (scene.getObjectById(this.forearmL.id) === undefined)
            scene.add(this.forearmL);

        this.handL.setMatrix(handLMatrix);

        if (scene.getObjectById(this.handL.id) === undefined)
            scene.add(this.handL);

        this.handR.setMatrix(handRMatrix);

        if (scene.getObjectById(this.handR.id) === undefined)
            scene.add(this.handR);

        this.footL.setMatrix(footLMatrix);

        if (scene.getObjectById(this.footL.id) === undefined)
            scene.add(this.footL);

        this.footR.setMatrix(footRMatrix);

        if (scene.getObjectById(this.footR.id) === undefined)
            scene.add(this.footR);

    }

    hideRobot() {
        this.spine.visible = false; this.forearmL.visible = false;
        this.chest.visible = false; this.forearmR.visible = false;
        this.neck.visible = false;  this.handR.visible = false;
        this.head.visible = false;  this.handL.visible = false;
        this.legL.visible = false;  this.footR.visible = false;
        this.legR.visible = false;  this.footL.visible = false;
        this.armL.visible = false;  this.shinL.visible = false;
        this.armR.visible = false;  this.shinR.visible = false;
    }
    hideHuman() {
        this.human.visible = false;
    }

    showRobot() {
        this.spine.visible = true; this.forearmL.visible = true;
        this.chest.visible = true; this.forearmR.visible = true;
        this.neck.visible = true;  this.handR.visible = true;
        this.head.visible = true;  this.handL.visible = true;
        this.legL.visible = true;  this.footR.visible = true;
        this.legR.visible = true;  this.footL.visible = true;
        this.armL.visible = true;  this.shinL.visible = true;
        this.armR.visible = true;  this.shinR.visible = true;

    }
    showHuman() {
        this.human.visible = true;
    }
	
	pose1(){
		// TODO DEFINIR LA PREMIERE POSE ICI
        const centreM = this.spineMatrix;
        const torse = matMul(centreM, this.chestMatrix);
        const neck = matMul(torse, this.neckMatrix);
        const tete = matMul(neck, this.headMatrix);
         let inter2 = matMul(this.armLMatrix,rotZ(-pi/2));
        const brasL = matMul(torse,inter2 );
        const angl = 2.35619; //j'utilise cette angle en radian pour faire une rotation
        let inter22 = matMul(this.forearmLMatrix,rotZ(angl));
        inter22 = matMul(inter22, translation(-this.armLength/2,this.armLength,0));
        const avBrasL = new THREE.Matrix4().multiplyMatrices(brasL,inter22);
        let inter3 = matMul(this.armRMatrix,rotZ(pi/2));
        const brasD = new THREE.Matrix4().multiplyMatrices(torse,inter3 );
        let inter33 = matMul(this.forearmRMatrix, rotZ(3*pi/4));
        inter33 = matMul(inter33, translation(-this.armLength/2,this.armLength,0));
        const avBrasD = matMul(brasD, inter33);
        const mainR = matMul(avBrasD,this.handRMatrix);
        const mainL = matMul(avBrasL, this.handLMatrix);
        let inter4 = matMul(this.leftLegMatrix,rotZ(pi));
        inter4 = matMul(inter4, rotX(pi/6));
        inter4 = matMul(inter4, translation(0,this.spineLength,0));
        const cuissG = matMul(centreM,inter4);
        let inter5 = matMul(this.rightLegMatrix,rotZ(pi));
        inter5 = matMul(inter5, rotX(pi/6));
        inter5 = matMul(inter5, translation(0,this.spineLength,0));
        const cuissD = matMul(centreM,inter5);
        let inter6 = matMul(this.shinLeftMatrix,rotZ(this.shinLeftRotation.z));
        inter6 = matMul(inter6, rotX(pi/2));
        inter6 = matMul(inter6, translation(0,this.shinLength/2,-this.shinLength/2));
        let sHinL = matMul(cuissG,inter6);
        let inter7 = matMul(this.shinRightMatrix, rotZ(this.shinRightRotation.z));
        inter7 = matMul(inter7, rotX(pi/2));
        inter7 = matMul(inter7, translation(0,this.shinLength/2,-this.shinLength/2));
        let sHinR = matMul(cuissD, inter7);
        let piedL = matMul(sHinL,this.footLMatrix);
        let piedR = matMul(sHinR,this.footRMatrix);
        //zone d'ajout
        this.spine.setMatrix(centreM);
        this.chest.setMatrix(torse);
        this.neck.setMatrix(neck);
        this.head.setMatrix(tete);
        this.armL.setMatrix(brasL);
        this.forearmL.setMatrix(avBrasL);
        this.armR.setMatrix(brasD);
        this.forearmR.setMatrix(avBrasD);
        this.handL.setMatrix(mainL);
        this.handR.setMatrix(mainR);
        this.legL.setMatrix(cuissG);
        this.legR.setMatrix(cuissD);
        this.shinL.setMatrix(sHinL);
        this.shinR.setMatrix(sHinR);
        this.footL.setMatrix(piedL);
        this.footR.setMatrix(piedR);
        //zone de maillage
        boneDict['Spine'].matrix=matMul(centreM,inverseOf(boneDict['Spine'].matrix));
        boneDict['Chest'].matrix=matMul(torse,inverseOf(boneDict['Chest'].matrix));
        boneDict['Neck'].matrix=matMul(neck,inverseOf(boneDict['Neck'].matrix));
        boneDict['Head'].matrix=matMul(tete,inverseOf(boneDict['Head'].matrix));
        boneDict['Arm_L'].matrix =matMul(brasL,inverseOf(boneDict['Arm_L'].matrix));
        boneDict['Forearm_L'].matrix=matMul(avBrasL,inverseOf(boneDict['Forearm_L'].matrix));
        boneDict['Arm_R'].matrix=matMul(brasD,inverseOf(boneDict['Arm_R'].matrix));
        boneDict['Forearm_R'].matrix=matMul(avBrasD,inverseOf(boneDict['Forearm_R'].matrix));
        boneDict['Leg_L'].matrix=matMul(cuissG,inverseOf(boneDict['Leg_L'].matrix));
        boneDict['Shin_L'].matrix=matMul(sHinL,inverseOf(boneDict['Shin_L'].matrix));
        boneDict['Leg_R'].matrix=matMul(cuissD,inverseOf(boneDict['Leg_R'].matrix));
        boneDict['Shin_R'].matrix=matMul(sHinR,inverseOf(boneDict['Shin_R'].matrix));
        buildShaderBoneMatrix();
	}
	
	pose2(){
		//TODO DEFINIR LA DEUXIEME POSE ICI
        this.centreH = new THREE.Matrix4().set(

            1, 0, 0, 2,
            0, 1, 0, this.spineTranslation.y+this.spineLength/2-this.legLength,
            0, 0, 1, 0,
            0, 0, 0, 1);
        const torse = matMul(this.centreH,this.chestMatrix);
        const cou = matMul(torse, this.neckMatrix);
        const tete = matMul(cou, this.headMatrix);
        let inter2 = matMul(this.armLMatrix ,rotZ(-pi/2));
        const brasL = matMul(torse,inter2);
        let inter3 = matMul(this.armRMatrix,rotZ(pi/2));
        const brasD = matMul(torse,inter3 );
        const avBR = matMul(brasD,this.forearmRMatrix);
        const avBL = matMul(brasL, this.forearmLMatrix);
        const mainR = matMul(avBR,this.handRMatrix);
        const mainL = matMul(avBL, this.handLMatrix);
        let temp2= matMul(this.leftLegMatrix,rotZ(pi));
        temp2 = matMul(temp2, translation(0,this.spineLength,0));
        const jambeL = matMul(this.centreH,temp2);
        let temp3 = matMul(this.rightLegMatrix,translation(0,-this.spineLength/2,this.spineLength/2));
        temp3 = matMul(temp3, rotX(-pi/2));
        const jambeR = matMul(this.centreH,temp3);
        let temp4 = matMul(this.shinLeftMatrix,rotZ(this.shinLeftRotation.z));
        temp4 = matMul(temp4, rotX(pi/2));
        temp4 = matMul(temp4, translation(0,this.shinLength/2,-this.shinLength/2));
        let sHinL = matMul(jambeL,temp4);
        //sHinL = matMul(sHinL,rotX(pi/2));
        let temp5 = matMul(this.shinRightMatrix, rotZ(this.shinRightRotation.z));
        temp5 = matMul(temp5, rotX(-pi/2));
        temp5 = matMul(temp5, translation(0,this.shinLength/2,this.shinLength/2));
        let sHinR = matMul(jambeR, temp5);
        //sHinR = matMul(sHinR, rotX(-pi/2));
        let piedL = matMul(sHinL,this.footLMatrix);
        let piedR = matMul(sHinR,this.footRMatrix);
        //zone d'ajout
        this.spine.setMatrix(this.centreH);
        this.chest.setMatrix(torse);
        this.neck.setMatrix(cou);
        this.head.setMatrix(tete);
        this.armL.setMatrix(brasL);
        this.armR.setMatrix(brasD);
        this.forearmR.setMatrix(avBR);
        this.forearmL.setMatrix(avBL);
        this.handR.setMatrix(mainR);
        this.handL.setMatrix(mainL);
        this.legL.setMatrix(jambeL);
        this.legR.setMatrix(jambeR);
        this.shinL.setMatrix(sHinL);
        this.shinR.setMatrix(sHinR);
        this.footL.setMatrix(piedL);
        this.footR.setMatrix(piedR);


        //introduction du maillage
        boneDict['Spine'].matrix=matMul(this.centreH,inverseOf(boneDict['Spine'].matrix));
        boneDict['Chest'].matrix=matMul(torse,inverseOf(boneDict['Chest'].matrix));
        boneDict['Neck'].matrix=matMul(cou,inverseOf(boneDict['Neck'].matrix));
        boneDict['Head'].matrix=matMul(tete,inverseOf(boneDict['Head'].matrix));
        boneDict['Arm_L'].matrix =matMul(brasL,inverseOf(boneDict['Arm_L'].matrix));
        boneDict['Forearm_L'].matrix=matMul(avBL,inverseOf(boneDict['Forearm_L'].matrix));
        boneDict['Arm_R'].matrix=matMul(brasD,inverseOf(boneDict['Arm_R'].matrix));
        boneDict['Forearm_R'].matrix=matMul(avBR,inverseOf(boneDict['Forearm_R'].matrix));
        boneDict['Leg_L'].matrix=matMul(jambeL,inverseOf(boneDict['Leg_L'].matrix));
        boneDict['Shin_L'].matrix=matMul(sHinL,inverseOf(boneDict['Shin_L'].matrix));
        boneDict['Leg_R'].matrix=matMul(jambeR,inverseOf(boneDict['Leg_R'].matrix));
        boneDict['Shin_R'].matrix=matMul(sHinR,inverseOf(boneDict['Shin_R'].matrix));
        buildShaderBoneMatrix();
	}
	
    animate(t) {
        // Do animation here
        //console.log(temps);
        let vitesse =Math.round(t);// temps;
        if(vitesse%2 === 1) {//
            const centreM = this.spineMatrix;
            const torse = matMul(centreM, this.chestMatrix);
            const neck = matMul(torse, this.neckMatrix);
            const tete = matMul(neck, this.headMatrix);

            let inter2 = matMul(this.armLMatrix, rotZ(pi));
            inter2 = matMul(inter2, rotX(-pi / 6));
            const brasL = matMul(torse, inter2);

            let inter22 = matMul(this.forearmLMatrix, rotX(-pi / 2));
            inter22 = matMul(inter22, translation(0, this.armLength/2, this.armLength/2));
            const avBrasL = new THREE.Matrix4().multiplyMatrices(brasL, inter22);

            let inter3 = matMul(this.armRMatrix, rotZ(pi));
            inter3 = matMul(inter3, rotX(pi / 6));
            const brasD = matMul(torse, inter3);

            let inter33 = matMul(this.forearmRMatrix, rotX( -pi / 2));
            inter33 = matMul(inter33, translation(0, this.armLength/2,this.armLength/2));
            const avBrasD = matMul(brasD, inter33);

            const mainR = matMul(avBrasD, this.handRMatrix);
            const mainL = matMul(avBrasL, this.handLMatrix);
            let inter4 = matMul(this.leftLegMatrix, rotZ(pi));
            inter4 = matMul(inter4, translation(0, this.spineLength, 0));
            const cuissG = matMul(centreM, inter4);
            let inter5 = matMul(this.rightLegMatrix, rotZ(pi));
            inter5 = matMul(inter5, rotX(-pi / 4));
            inter5 = matMul(inter5, translation(0, this.spineLength, 0));
            const cuissD = matMul(centreM, inter5);
            let inter6 = matMul(this.shinLeftMatrix, rotZ(this.shinLeftRotation.z));
            let sHinL = matMul(cuissG, inter6);
            let inter7 = matMul(this.shinRightMatrix, rotZ(this.shinRightRotation.z));
            inter7 = matMul(inter7, rotX(pi / 2));
            inter7 = matMul(inter7, translation(0, this.shinLength / 2, -this.shinLength / 2));
            let sHinR = matMul(cuissD, inter7);
            let piedL = matMul(sHinL, this.footLMatrix);
            let piedR = matMul(sHinR, this.footRMatrix);
            //zone d'ajout
            this.spine.setMatrix(centreM);
            this.chest.setMatrix(torse);
            this.neck.setMatrix(neck);
            this.head.setMatrix(tete);
            this.armL.setMatrix(brasL);
            this.forearmL.setMatrix(avBrasL);
            this.armR.setMatrix(brasD);
            this.forearmR.setMatrix(avBrasD);
            this.handL.setMatrix(mainL);
            this.handR.setMatrix(mainR);
            this.legL.setMatrix(cuissG);
            this.legR.setMatrix(cuissD);
            this.shinL.setMatrix(sHinL);
            this.shinR.setMatrix(sHinR);
            this.footL.setMatrix(piedL);
            this.footR.setMatrix(piedR);

            //zone de maillage
            boneDict['Spine'].matrix=matMul(centreM,inverseOf(boneDict['Spine'].matrix));
            boneDict['Chest'].matrix=matMul(torse,inverseOf(boneDict['Chest'].matrix));
            boneDict['Neck'].matrix=matMul(neck,inverseOf(boneDict['Neck'].matrix));
            boneDict['Head'].matrix=matMul(tete,inverseOf(boneDict['Head'].matrix));
            boneDict['Arm_L'].matrix =matMul(brasL,inverseOf(boneDict['Arm_L'].matrix));
            boneDict['Forearm_L'].matrix=matMul(avBrasL,inverseOf(boneDict['Forearm_L'].matrix));
            boneDict['Arm_R'].matrix=matMul(brasD,inverseOf(boneDict['Arm_R'].matrix));
            boneDict['Forearm_R'].matrix=matMul(avBrasD,inverseOf(boneDict['Forearm_R'].matrix));
            boneDict['Leg_L'].matrix=matMul(cuissG,inverseOf(boneDict['Leg_L'].matrix));
            boneDict['Shin_L'].matrix=matMul(sHinL,inverseOf(boneDict['Shin_L'].matrix));
            boneDict['Leg_R'].matrix=matMul(cuissD,inverseOf(boneDict['Leg_R'].matrix));
            boneDict['Shin_R'].matrix=matMul(sHinR,inverseOf(boneDict['Shin_R'].matrix));
            buildShaderBoneMatrix();
        }else {

            const centreM = this.spineMatrix;
            const torse = matMul(centreM, this.chestMatrix);//
            const neck = matMul(torse, this.neckMatrix);
            const tete = matMul(neck, this.headMatrix);
            let inter2 = matMul(this.armLMatrix, rotZ(pi));
            inter2 = matMul(inter2, rotX(pi / 4));
            const brasL = matMul(torse, inter2);
            let inter22 = matMul(this.forearmLMatrix, rotX(-pi / 2));
            inter22 = matMul(inter22, translation(0, this.armLength / 2, this.armLength / 2));
            const avBrasL = new THREE.Matrix4().multiplyMatrices(brasL, inter22);
            let inter3 = matMul(this.armRMatrix, rotZ(pi));
            inter3 = matMul(inter3, rotX(-pi / 6));
            const brasD = matMul(torse, inter3);
            let inter33 = matMul(this.forearmRMatrix, rotX(-pi / 2));
            inter33 = matMul(inter33, translation(0, this.armLength / 2, this.armLength / 2));
            const avBrasD = matMul(brasD, inter33);
            const mainR = matMul(avBrasD, this.handRMatrix);
            const mainL = matMul(avBrasL, this.handLMatrix);
            let inter4 = matMul(this.leftLegMatrix, rotZ(pi));
            inter4 = matMul(inter4, rotX(-pi / 4));
            inter4 = matMul(inter4, translation(0, this.spineLength, 0));
            const cuissG = matMul(centreM, inter4);
            let inter5 = matMul(this.rightLegMatrix, rotZ(pi));
            inter5 = matMul(inter5, translation(0, this.spineLength, 0));
            const cuissD = matMul(centreM, inter5);
            let inter6 = matMul(this.shinLeftMatrix, rotZ(this.shinLeftRotation.z));
            inter6 = matMul(inter6, rotX(pi / 2));
            inter6 = matMul(inter6, translation(0, this.shinLength/2, -this.shinLength / 2));
            let sHinL = matMul(cuissG, inter6);
            let sHinR = matMul(cuissD, this.shinRightMatrix);
            let piedL = matMul(sHinL, this.footLMatrix);
            let piedR = matMul(sHinR, this.footRMatrix);
            //zone d'ajout
            this.spine.setMatrix(centreM);
            this.chest.setMatrix(torse);
            this.neck.setMatrix(neck);
            this.head.setMatrix(tete);
            this.armL.setMatrix(brasL);
            this.forearmL.setMatrix(avBrasL);
            this.armR.setMatrix(brasD);
            this.forearmR.setMatrix(avBrasD);
            this.handL.setMatrix(mainL);
            this.handR.setMatrix(mainR);
            this.legL.setMatrix(cuissG);
            this.legR.setMatrix(cuissD);
            this.shinL.setMatrix(sHinL);
            this.shinR.setMatrix(sHinR);
            this.footL.setMatrix(piedL);
            this.footR.setMatrix(piedR);

            //zone de maillage

            boneDict['Spine'].matrix=matMul(centreM,inverseOf(boneDict['Spine'].matrix));
            boneDict['Chest'].matrix=matMul(torse,inverseOf(boneDict['Chest'].matrix));
            boneDict['Neck'].matrix=matMul(neck,inverseOf(boneDict['Neck'].matrix));
            boneDict['Head'].matrix=matMul(tete,inverseOf(boneDict['Head'].matrix));
            boneDict['Arm_L'].matrix =matMul(brasL,inverseOf(boneDict['Arm_L'].matrix));
            boneDict['Forearm_L'].matrix=matMul(avBrasL,inverseOf(boneDict['Forearm_L'].matrix));
            boneDict['Arm_R'].matrix=matMul(brasD,inverseOf(boneDict['Arm_R'].matrix));
            boneDict['Forearm_R'].matrix=matMul(avBrasD,inverseOf(boneDict['Forearm_R'].matrix));
            boneDict['Leg_L'].matrix=matMul(cuissG,inverseOf(boneDict['Leg_L'].matrix));
            boneDict['Shin_L'].matrix=matMul(sHinL,inverseOf(boneDict['Shin_L'].matrix));
            boneDict['Leg_R'].matrix=matMul(cuissD,inverseOf(boneDict['Leg_R'].matrix));
            boneDict['Shin_R'].matrix=matMul(sHinR,inverseOf(boneDict['Shin_R'].matrix));
            buildShaderBoneMatrix();
        }
    }
}

function inverseOf(M) {

    var r = M.clone();

    return r.invert();
}
var keyboard = new THREEx.KeyboardState();
var channel = 'p';
var pi = Math.PI;

function init() {

    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(8, 10, 8);
    camera.lookAt(0, 3, 0);

    scene = new THREE.Scene();
    scene.add(camera);

    controls = new OrbitControls(camera, container);
    controls.damping = 0.2;

    clock = new THREE.Clock();

    boneDict = {}

    boneArray = new Float32Array(12 * 16);

    humanMaterial = new THREE.ShaderMaterial({
        uniforms: {
            bones: {
                value: boneArray
            }
        }
    });

    const shaderLoader = new THREE.FileLoader();
    shaderLoader.load('glsl/human.vs.glsl',
        function (data) {
        humanMaterial.vertexShader = data;
    })
    shaderLoader.load('glsl/human.fs.glsl',
        function (data) {
        humanMaterial.fragmentShader = data;
    })

    // loading manager

    const loadingManager = new THREE.LoadingManager(function () {
        scene.add(humanMesh);
    });

    // collada
    humanGeometry = new THREE.BufferGeometry();
    const loader = new ColladaLoader(loadingManager);
    loader.load('./model/human.dae', function (collada) {
		skinIndices = collada.library.geometries['human-mesh'].build.triangles.data.attributes.skinIndex.array;
        skinWeight = collada.library.geometries['human-mesh'].build.triangles.data.attributes.skinWeight.array;
		realBones = collada.library.nodes.human.build.skeleton.bones;

        buildSkeleton();
        buildShaderBoneMatrix();
        humanGeometry.setAttribute('position', new THREE.BufferAttribute(collada.library.geometries['human-mesh'].build.triangles.data.attributes.position.array, 3));
        humanGeometry.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeight, 4));
        humanGeometry.setAttribute('skinIndex', new THREE.BufferAttribute(skinIndices, 4));
        humanGeometry.setAttribute('normal', new THREE.BufferAttribute(collada.library.geometries['human-mesh'].build.triangles.data.attributes.normal.array, 3));

        humanMesh = new THREE.Mesh(humanGeometry, humanMaterial);
        robot = new Robot(humanMesh);
        robot.hideHuman();

    });

    //

    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 0).normalize();
    scene.add(directionalLight);

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //

    stats = new Stats();
    container.appendChild(stats.dom);

    //

    window.addEventListener('resize', onWindowResize);
    lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set( - 100,  - 200,  - 100);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);

    var floorTexture = new THREE.ImageUtils.loadTexture('textures/hardwood2_diffuse.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);

    var floorMaterial = new THREE.MeshBasicMaterial({
        map: floorTexture,
        side: THREE.DoubleSide
    });
    var floorGeometry = new THREE.PlaneBufferGeometry(30, 30);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y -= 2.5;
    scene.add(floor);

}


function buildSkeleton() {
	boneDict["Spine"] = new THREE.Bone();
	boneDict["Chest"] = new THREE.Bone();
	boneDict["Neck"] = new THREE.Bone();
	boneDict["Head"] = new THREE.Bone();
	boneDict["Arm_L"] = new THREE.Bone();
	boneDict["Forearm_L"] = new THREE.Bone();
	boneDict["Arm_R"] = new THREE.Bone();
	boneDict["Forearm_R"] = new THREE.Bone();
	boneDict["Leg_L"] = new THREE.Bone();
	boneDict["Shin_L"] = new THREE.Bone();
	boneDict["Leg_R"] = new THREE.Bone();
	boneDict["Shin_R"] = new THREE.Bone();
	

 	boneDict['Chest'].matrixWorld = matMul(boneDict['Spine'].matrixWorld, realBones[1].matrix);
	boneDict['Neck'].matrixWorld = matMul(boneDict['Chest'].matrixWorld, realBones[2].matrix);
	boneDict['Head'].matrixWorld = matMul(boneDict['Neck'].matrixWorld, realBones[3].matrix);
	boneDict['Arm_L'].matrixWorld = matMul(boneDict['Chest'].matrixWorld, realBones[4].matrix);
	boneDict['Forearm_L'].matrixWorld = matMul(boneDict['Arm_L'].matrixWorld, realBones[5].matrix);
	boneDict['Arm_R'].matrixWorld = matMul(boneDict['Chest'].matrixWorld, realBones[6].matrix);
	boneDict['Forearm_R'].matrixWorld = matMul(boneDict['Arm_R'].matrixWorld, realBones[7].matrix);
	boneDict['Leg_L'].matrixWorld = matMul(boneDict['Spine'].matrixWorld, realBones[8].matrix);
	boneDict['Shin_L'].matrixWorld = matMul(boneDict['Leg_L'].matrixWorld, realBones[9].matrix);
	boneDict['Leg_R'].matrixWorld = matMul(boneDict['Spine'].matrixWorld, realBones[10].matrix);
	boneDict['Shin_R'].matrixWorld = matMul(boneDict['Leg_R'].matrixWorld, realBones[11].matrix);

}

/**
* Fills the Float32Array boneArray with the bone matrices to be passed to
* the vertex shader
*/
function buildShaderBoneMatrix() {
    var c = 0;
    for (var key in boneDict) {
        for (var i = 0; i < 16; i++) {
            boneArray[c++] = boneDict[key].matrix.elements[i];
        }
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    checkKeyboard();

    updateBody();
    requestAnimationFrame(animate);
    render();
    stats.update();

}

function render() {

    const delta = clock.getDelta();

    renderer.render(scene, camera);

}



/**
* Returns a new Matrix4 as a multiplcation of m1 and m2
*
* @param {Matrix4} m1 The first matrix
* @param {Matrix4} m2 The second matrix
* @return {Matrix4} m1 x m2
*/
function matMul(m1, m2) {
    return new THREE.Matrix4().multiplyMatrices(m1, m2);
}

/**
* Returns a new Matrix4 as a scalar multiplcation of s and m
*
* @param {number} s The scalar
* @param {Matrix4} m The  matrix
* @return {Matrix4} s * m2
*/
function scalarMul(s, m) {
    var r = m;
    return r.multiplyScalar(s)
}

/**
* Returns an array containing the x,y and z translation component 
* of a transformation matrix
*
* @param {Matrix4} M The transformation matrix
* @return {Array} x,y,z translation components
*/
function getTranslationValues(M) {
    var elems = M.elements;
    return elems.slice(12, 15);
}

/**
* Returns a new Matrix4 as a translation matrix of [x,y,z]
*
* @param {number} x x component
* @param {number} y y component
* @param {number} z z component
* @return {Matrix4} The translation matrix of [x,y,z]
*/
function translation(x, y, z) {
	//TODO Définir cette fonction
    return new THREE.Matrix4().set(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1);
}

/**
* Returns a new Matrix4 as a rotation matrix of theta radians around the x-axis
*
* @param {number} theta The angle expressed in radians
* @return {Matrix4} The rotation matrix of theta rad around the x-axis
*/
function rotX(theta) {
	//TODO Définir cette fonction
    return new THREE.Matrix4().set(
        1, 0, 0, 0,
        0, cos(theta), sin(theta), 0,
        0, -sin(theta), cos(theta), 0,
        0, 0, 0, 1);
}

/**
* Returns a new Matrix4 as a rotation matrix of theta radians around the y-axis
*
* @param {number} theta The angle expressed in radians
* @return {Matrix4} The rotation matrix of theta rad around the y-axis
*/
function rotY(theta) {
	//TODO Définir cette fonction
    return new THREE.Matrix4().set(
        cos(theta), 0, -sin(theta), 0,
        0, 1, 0, 0,
        sin(theta), 0, cos(theta), 0,
        0, 0, 0, 1);
}

/**
* Returns a new Matrix4 as a rotation matrix of theta radians around the z-axis
*
* @param {number} theta The angle expressed in radians
* @return {Matrix4} The rotation matrix of theta rad around the z-axis
*/
function rotZ(theta) {
	//TODO Définir cette fonction
    return new THREE.Matrix4().set(
        cos(theta), -sin(theta), 0, 0,
        sin(theta), cos(theta), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);
}

/**
* Returns a new Matrix4 as a scaling matrix with factors of x,y,z
*
* @param {number} x x component
* @param {number} y y component
* @param {number} z z component
* @return {Matrix4} The scaling matrix with factors of x,y,z
*/
function scale(x, y, z) {
	//TODO Définir cette fonction
    return new THREE.Matrix4().set(
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1);
}

function cos(angle) {
    return Math.cos(angle);
}

function sin(angle) {
    return Math.sin(angle);
}

function checkKeyboard() {
    for (var i = 0; i < 10; i++) {
        if (keyboard.pressed(i.toString())) {
            channel = i;
            break;
        }
    }
}
function updateBody() {

    switch (channel) {
    case 0:
        var t = clock.getElapsedTime();
        robot.animate(t);

        break;

        // add poses here:
    case 1:
        robot.pose1();
        break;

    case 2:
        robot.pose2();
        break;

    case 3:
        break;

    case 4:
        break;

    case 5:
        break;
    case 6:
        robot.hideRobot();
        break;
    case 7:
        robot.showRobot();
        break;
    case 8:
        robot.hideHuman();
        break;
    case 9:
        robot.showHuman();
        break;
    default:
        break;
    }
}

init();
animate();
