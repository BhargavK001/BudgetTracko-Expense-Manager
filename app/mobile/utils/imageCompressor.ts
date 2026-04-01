import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Resizes and compresses an image to aggressively reduce file size.
 * This is crucial to prevent "413 Request Entity Too Large" errors from Nginx/Backend.
 */
export async function compressImage(uri: string): Promise<string> {
    try {
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 800 } }], // Resize width down
            {
                compress: 0.6, // Aggressive compression (0 - 1)
                format: ImageManipulator.SaveFormat.JPEG
            }
        );
        return manipResult.uri;
    } catch (e) {
        console.warn('Failed to compress image:', e);
        return uri; // Fallback to original
    }
}
