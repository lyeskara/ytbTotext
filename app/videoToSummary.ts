import ytdl from 'ytdl-core';
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import { URL, URLSearchParams } from 'url'
import { Configuration, OpenAIApi } from "openai"
import Error from 'next/error';
import { error } from 'console';
import { resolve } from 'path';


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    baseOptions: {
        maxBodyLength: 26214400 // 25 MB
    }
});

const openai = new OpenAIApi(configuration);

let summary: string | undefined;

export async function videoToSummary(urlstring: string) {

    const videoID = getYouTubeVideoID(urlstring)
    const outputFile = `/home/music/${videoID}.mp3`

    const videoReadableStream = ytdl(urlstring, {
        filter: 'audioonly',
        quality: 'highestaudio',
    });
    try {
        await convertVideoToAudio(videoReadableStream, outputFile)
    } catch (error) {
        console.log("converting video to audio has failed")
        return;
    }

    try {
        const transcript = await transcribeAudio(outputFile);
        if (!transcript) {
            console.log('No transcript available.');
            return null;
        }
        summary = await SummarizeTranscript(transcript)
        if (!summary) {
            console.log('No Summary available.');
            return null;
        }
    } catch (error) {
        console.error('Error processing audio:', error);
        return null;
    }

}

function getYouTubeVideoID(url: string) {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    return params.get('v');
};

function convertVideoToAudio(videoReadableStream: any, outputFile: string) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoReadableStream)
            .audioBitrate(128)
            .toFormat('mp3')
            .save(outputFile)
            .on('end', () => {
                resolve('Conversion from video to audio complete.');
            })
            .on('error', (err) => {
                console.error(err);
                reject(err);
            });
    })

}

async function transcribeAudio(filename: string) {
    try {
        const transcript = await openai.createTranscription(
            fs.createReadStream(filename) as any,
            "whisper-1"
        );
        return transcript.data.text
    } catch (Error) {
        // Handle the error 
        console.error("An error occurred:", Error);
    }
}

async function SummarizeTranscript(transcript: any) {
    try {
        // Call the API with the current conversation
        const GPTresponse = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: "user",
                    content: `i will give a prompt that is speaking of a certain subject.
                              i want you to include the main points of this subject. 
                              include what the author said that is important and add details if the author is lacking. 
                              i would like you to be concise in your answer with no boilerplate just straight to the point.
                              dont go over 20 lines when explaining. 
                              here is the prompt: ${transcript}`
                }],
        });
        // Get Ai text
        let summary = GPTresponse?.data?.choices[0]?.message?.content
        if (summary !== undefined) {
            return summary
        }

    } catch (Error) {
        // Handle the error 
        console.error("An error occurred:", Error);

    }
}

export function displaySummary() {
    if (summary) {
        return summary
    }
    return null
}