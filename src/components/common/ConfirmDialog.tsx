import { Alert } from "react-native";

interface ConfirmDialogOptions {

    title: string;

    message: string;

    onConfirm: () => void;

    onCancel?: () => void;

    confirmText?: string;

    cancelText?: string;

    confirmStyle?: "default" | "cancel" | "destructive";

}

export function ConfirmDialog({

    title,

    message,

    onConfirm,

    onCancel,

    confirmText = "Confirm",

    cancelText = "Cancel",

    confirmStyle = "default",

}: ConfirmDialogOptions) {

    Alert.alert(

        title,

        message,

        [

            {

                text: cancelText,

                style: "cancel",

                onPress: onCancel,

            },

            {

                text: confirmText,

                style: confirmStyle ?? "default",

                onPress: onConfirm,

            },

        ]

    );

}