import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import os from 'os';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export class FileCompressor {
  /**
   * Сжатие изображения (конвертация в WebP)
   * @param buffer Буфер изображения
   * @returns Буфер сжатого изображения
   */
  static async compressImage(buffer: Buffer): Promise<Buffer> {
    console.log('Starting image compression...');
    try {
      const compressedImage = await sharp(buffer)
        .resize(800) // Уменьшаем ширину до 800px
        .webp({ quality: 80 }) // Конвертируем в webp и снижаем качество
        .toBuffer();

      console.log('Image compression completed successfully');
      return compressedImage;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Error compressing image');
    }
  }

  /**
   * Сжатие видео (через временный файл)
   * @param buffer Буфер видео
   * @returns Буфер сжатого видео
   */
  static async compressVideo(buffer: Buffer): Promise<Buffer> {
    const inputPath = path.join(os.tmpdir(), `input-${Date.now()}.mp4`);
    const outputPath = path.join(os.tmpdir(), `output-${Date.now()}.mp4`);

    console.log('Starting video compression...');

    try {
      console.log('Saving input video to temporary file...');
      await writeFile(inputPath, buffer);
      console.log('Input video saved to:', inputPath);

      console.log('Starting video compression with ffmpeg...');
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions('-t 00:01:00') // Обрезаем до 1 минуты
          .outputOptions('-b:v 500k') // Сжимаем битрейт
          .save(outputPath)
          .on('end', () => {
            console.log('Video compression completed');
            resolve();
          })
          .on('error', (err) => {
            console.error('Error during video compression:', err);
            reject(err);
          });
      });

      console.log('Reading compressed video from file...');
      const compressedBuffer = await fs.promises.readFile(outputPath);
      console.log('Video compression completed successfully');
      return compressedBuffer;
    } catch (error) {
      console.error('Error compressing video:', error);
      throw new Error('Error compressing video');
    } finally {
      console.log('Cleaning up temporary files...');
      await unlink(inputPath).catch(() => console.log(`Failed to delete ${inputPath}`));
      await unlink(outputPath).catch(() => console.log(`Failed to delete ${outputPath}`));
    }
  }
}

