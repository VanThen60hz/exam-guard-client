import { Results } from "@mediapipe/face_detection";
import { useState } from "react";

export interface FaceCoordinates {
    leftEye: number;
    leftEar: number;
    rightEye: number;
    rightEar: number;
}

export const extractFaceCoordinates = (result: Results): FaceCoordinates => {
    if (result.detections.length < 1) {
        return {
            leftEye: 999,
            leftEar: 999,
            rightEye: 999,
            rightEar: 999,
        };
    }

    // result.detections[0].landmarks[i]
    // i ---> landmark
    // 0 ---> Left Eye
    // 1 ---> Right Eye
    // 2 ---> Mouth
    // 3 ---> Chin
    // 4 ---> Left Ear
    // 5 ---> Right Ear

    const [leftEye, rightEye, , , leftEar, rightEar] =
        result.detections[0].landmarks;

    return {
        leftEye: leftEye.x,
        leftEar: leftEar.x,
        rightEye: rightEye.x,
        rightEar: rightEar.x,
    };
};

export const printLandmarks = (result: Results) => {
    if (result.detections.length < 1) {
        return;
    }

    const { leftEar, leftEye, rightEar, rightEye } =
        extractFaceCoordinates(result);

    console.log("----------------------");
    console.log(`LEFT EAR: ${leftEar}`);
    console.log(`LEFT EYE: ${leftEye}`);
    console.log("----------------------");
    console.log(`RIGHT EYE: ${rightEye}`);
    console.log(`RIGHT EAR: ${rightEar}`);
    console.log("----------------------");
};

export const detectCheating = (
    faceCoordinates: FaceCoordinates,
    printRefults: boolean = false
) => {
    // const [lookingLeft, setlookingLeft] = useState(false);
    // const [lookingRight, setlookingRight] = useState(false);
    let lookingLeft = false;
    let lookingRight = false;
    let noFace = false;

    const { leftEar, leftEye, rightEar, rightEye } = faceCoordinates;

    if (
        leftEar == 999 &&
        leftEye == 999 &&
        rightEar == 999 &&
        rightEye == 999
    ) {
        noFace = true;
    } else {
        const leftCoordDistance = leftEye - leftEar;
        const rightCoordDistance = rightEar - rightEye;
        // const lookingLeft = leftCoordDistance <= 0.03;
        // const lookingRight = rightCoordDistance <= 0.03;
        lookingLeft = leftCoordDistance <= 0.03;
        lookingRight = rightCoordDistance <= 0.03;
    }

    // Old Approcah: ears and eyes crossing
    // const lookingLeft = leftEye.x <= leftEar.x;
    // const lookingRight = RightEye.x >= rightEar.x;

    // The higher the distance, the difficult it is to cheat

    if (printRefults) {
        console.log("----------------------");
        console.log(`LOOKING LEFT: ${lookingLeft}`);
        console.log(`LOOKING RIGHT: ${lookingRight}`);
        console.log("----------------------");
    }

    return [lookingLeft, lookingRight, noFace];
};

export const getCheatingStatus = (
    lookingLeft: boolean,
    lookingRight: boolean,
    noFace: boolean
): string => {
    if (lookingLeft) return "Cheating Detected: You're looking left";
    else if (lookingRight) return "Cheating Detected: You're looking right";
    else if (noFace) return "Cheating Detected: Face not detected";
    else return "Everything okay!";
};

export const b64toBlob = async (base64: string) =>
    fetch(base64).then((res) => res.blob());
