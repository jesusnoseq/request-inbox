import { signUp, confirmSignUp, type ConfirmSignUpInput, signIn, type SignInInput, autoSignIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

type SignUpParameters = {
    username: string;
    password: string;
    email: string;
    autoSignIn: boolean;
};

const handleError = (error: any) => {
    if (error instanceof Error) {
        console.log(`error handled in ${getCallerName()}: ${error.name}`);
        return { success: false, error }
    }
    console.log(`unknown error in ${getCallerName()} : ${error}`);
    return { success: false, error: ("" + error) }
}

function getCallerName() {
    const err = new Error();
    const stack = err.stack;
    if (stack) {
        const lines = stack.split('\n');
        const callerLine = lines[3] || lines[4];
        const match = callerLine.match(/at (\S+)/);
        return match ? match[1] : 'anonymous';
    }
    return 'anonymous';
}


export const doSignUp = async ({
    username,
    password,
    email,
    autoSignIn,
}: SignUpParameters) => {
    try {
        const { isSignUpComplete, userId, nextStep } = await signUp({
            username,
            password,
            options: {
                userAttributes: {
                    email,
                },
                autoSignIn
            }
        });
        console.log("doSignUp", userId, isSignUpComplete, nextStep);
        return { success: isSignUpComplete, next: nextStep };
    } catch (error) {
        return handleError(error);
    }

}


export const doSignUpConfirmation = async ({
    username,
    confirmationCode
}: ConfirmSignUpInput) => {
    try {
        const { isSignUpComplete, nextStep } = await confirmSignUp({
            username,
            confirmationCode
        });

        console.log("doSignUpConfirmation ", isSignUpComplete, nextStep);
        return { success: isSignUpComplete, next: nextStep };
    } catch (error) {
        return handleError(error);
    }

}



export const doSignIn = async ({ username, password }: SignInInput) => {
    try {
        const { isSignedIn, nextStep } = await signIn({ username, password });
        console.log("handleSignIn", isSignedIn, nextStep);
        return { success: isSignedIn, next: nextStep };
    } catch (error) {
        return handleError(error);
    };
}



export const doAutoSignIn = async () => {
    try {
        const signInOutput = await autoSignIn();
        console.log("doAutoSignIn", signInOutput);
    } catch (error) {
        return handleError(error);
    }
}

export const doSignOut = async () => {
    try {
        await signOut();
        console.log("handleSignOut");
    } catch (error) {
        return handleError(error);
    }
}

export const queryUserData = async () => {
    try {
        const userData = await getCurrentUser();
        return userData;
    } catch (error) {
        return handleError(error);
    }
}


export const isUserLogged = async () => {
    try {
        const session = await fetchAuthSession();
        console.log(session.identityId);
        return session;
    } catch (error) {
        return handleError(error);
    }
}