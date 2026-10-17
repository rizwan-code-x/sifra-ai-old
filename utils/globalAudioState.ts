import { useState, useEffect } from 'react';

export interface Track {
    id: string;
    title: string;
    artist: string;
    url: string;
}

class GlobalAudioPlayer {
    audio: HTMLAudioElement;
    currentTrack: Track | null = null;
    tracks: Track[] = [];
    isPlaying: boolean = false;
    progress: number = 0;
    
    audioCtx: AudioContext | null = null;
    analyser: AnalyserNode | null = null;
    source: MediaElementAudioSourceNode | null = null;
    audioData: Uint8Array = new Uint8Array(0);

    listeners: Set<() => void> = new Set();
    animFrame: number = 0;

    constructor() {
        this.audio = new Audio();
        this.audio.crossOrigin = "anonymous";
        this.audio.addEventListener('timeupdate', () => {
            if (this.audio.duration > 0) {
                this.progress = (this.audio.currentTime / this.audio.duration) * 100;
                this.notify();
            }
        });
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.progress = 0;
            this.next();
        });
        this.audio.addEventListener('play', () => {
             this.isPlaying = true;
             this.initAudioContext();
             this.startAnalyser();
             this.notify();
        });
        this.audio.addEventListener('pause', () => {
             this.isPlaying = false;
             this.stopAnalyser();
             this.notify();
        });
    }
    
    initAudioContext() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
                this.analyser = this.audioCtx.createAnalyser();
                this.analyser.fftSize = 64;
                this.source = this.audioCtx.createMediaElementSource(this.audio);
                this.source.connect(this.analyser);
                this.analyser.connect(this.audioCtx.destination);
                this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
            }
        }
        if (this.audioCtx?.state === 'suspended') {
            this.audioCtx.resume();
        }
    }
    
    startAnalyser() {
        const update = () => {
            if (this.analyser && this.isPlaying) {
                this.analyser.getByteFrequencyData(this.audioData);
                this.notify();
            }
            this.animFrame = requestAnimationFrame(update);
        };
        update();
    }
    
    stopAnalyser() {
        cancelAnimationFrame(this.animFrame);
    }

    notify() {
        this.listeners.forEach(l => l());
    }

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    updateTracks(newTracks: Track[]) {
        this.tracks = newTracks;
        this.notify();
    }

    playTrack(track: Track, trackList: Track[]) {
        this.tracks = trackList;
        if (this.currentTrack?.id !== track.id) {
            this.currentTrack = track;
            this.audio.src = track.url;
            this.audio.play();
        } else {
            this.audio.play();
        }
        this.isPlaying = true;
        this.notify();
    }

    togglePlay() {
        if (!this.currentTrack) return;
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
    }

    next() {
        if (!this.currentTrack || this.tracks.length === 0) return;
        const idx = this.tracks.findIndex(t => t.id === this.currentTrack!.id);
        if (idx !== -1 && idx < this.tracks.length - 1) {
            this.playTrack(this.tracks[idx + 1], this.tracks);
        } else {
            this.currentTrack = null;
            this.isPlaying = false;
            this.progress = 0;
            this.audio.src = '';
            this.notify();
        }
    }

    prev() {
        if (!this.currentTrack || this.tracks.length === 0) return;
        const idx = this.tracks.findIndex(t => t.id === this.currentTrack!.id);
        if (idx > 0) {
            this.playTrack(this.tracks[idx - 1], this.tracks);
        }
    }

    seek(progressPercent: number) {
        if (this.audio.duration) {
            this.audio.currentTime = (progressPercent / 100) * this.audio.duration;
            this.progress = progressPercent;
            this.notify();
        }
    }
    
    skip(seconds: number) {
        if (this.audio.duration) {
            let newTime = this.audio.currentTime + seconds;
            if (newTime < 0) newTime = 0;
            if (newTime > this.audio.duration) newTime = this.audio.duration;
            this.audio.currentTime = newTime;
        }
    }
}

export const globalPlayer = new GlobalAudioPlayer();

export function useGlobalAudio() {
    const [state, setState] = useState({
        currentTrack: globalPlayer.currentTrack,
        isPlaying: globalPlayer.isPlaying,
        progress: globalPlayer.progress,
        tracks: globalPlayer.tracks,
        audioData: globalPlayer.audioData
    });

    useEffect(() => {
        let lastNotify = performance.now();
        const handleRefresh = () => {
            const now = performance.now();
            if (now - lastNotify > 50) { // throttle UI updates to ~20fps to avoid React choking
                setState({
                    currentTrack: globalPlayer.currentTrack,
                    isPlaying: globalPlayer.isPlaying,
                    progress: globalPlayer.progress,
                    tracks: globalPlayer.tracks,
                    audioData: new Uint8Array(globalPlayer.audioData)
                });
                lastNotify = now;
            }
        };
        return globalPlayer.subscribe(handleRefresh);
    }, []);

    return {
        ...state,
        playTrack: (t: Track, list: Track[]) => globalPlayer.playTrack(t, list),
        togglePlay: () => globalPlayer.togglePlay(),
        seek: (pct: number) => globalPlayer.seek(pct),
        skip: (sec: number) => globalPlayer.skip(sec),
        next: () => globalPlayer.next(),
        prev: () => globalPlayer.prev(),
        updateTracks: (list: Track[]) => globalPlayer.updateTracks(list)
    };
}
