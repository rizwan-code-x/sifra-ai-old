
import { useEffect, useRef, RefObject } from 'react';

// A helper class for a single particle in our galaxy visualization
class Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;

    constructor(x: number, y: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
    }

    update(canvasWidth: number, canvasHeight: number) {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvasWidth) this.speedX *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.speedY *= -1;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export const useAudioVisualizer = (
    canvasRef: RefObject<HTMLCanvasElement>,
    analyserNode: AnalyserNode | null,
    isListening: boolean,
    isSifraSpeaking: boolean
) => {
    const animationFrameId = useRef<number>();
    const particles = useRef<Particle[]>([]);
    const time = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Initialize particles
        if (particles.current.length === 0) {
            for (let i = 0; i < 100; i++) {
                const size = Math.random() * 1.5 + 0.5;
                const color = `rgba(255, 255, 255, ${Math.random() * 0.6 + 0.2})`;
                particles.current.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height, size, color));
            }
        }

        let dataArray: Uint8Array | null = null;
        if (isListening && analyserNode) {
            analyserNode.fftSize = 256;
            const bufferLength = analyserNode.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        }

        const draw = () => {
            animationFrameId.current = requestAnimationFrame(draw);
            time.current += 0.01;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height));
            gradient.addColorStop(0, '#1e1a3b');
            gradient.addColorStop(1, '#100e23');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw and update particles for the starfield effect
            particles.current.forEach(p => {
                p.update(canvas.width, canvas.height);
                p.draw(ctx);
            });
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            let audioLevel = 0;
            if (isListening && analyserNode && dataArray) {
                analyserNode.getByteTimeDomainData(dataArray);
                audioLevel = dataArray.reduce((acc, val) => acc + Math.abs(val - 128), 0) / dataArray.length / 100;
            }

            // Central Orb
            const baseRadius = 60;
            let radius = baseRadius;
            let glowColor = 'rgba(192, 113, 255, 0.4)';

            if (isListening) {
                radius = baseRadius + audioLevel * 150;
                glowColor = `rgba(255, 128, 219, ${0.4 + audioLevel * 2})`;
            } else if (isSifraSpeaking) {
                radius = baseRadius + Math.sin(time.current * 5) * 10;
                glowColor = 'rgba(113, 199, 255, 0.6)';
            } else {
                radius = baseRadius + Math.sin(time.current) * 5;
            }

            // Draw outer glow
            ctx.beginPath();
            const glowGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.5);
            glowGradient.addColorStop(0, glowColor);
            glowGradient.addColorStop(1, 'rgba(192, 113, 255, 0)');
            ctx.fillStyle = glowGradient;
            ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Draw main orb
            ctx.beginPath();
            const orbGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            orbGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            orbGradient.addColorStop(0.7, 'rgba(216, 180, 254, 0.9)');
            orbGradient.addColorStop(1, 'rgba(120, 87, 255, 0.9)');
            ctx.fillStyle = orbGradient;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
        };

        draw();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isListening, isSifraSpeaking, analyserNode, canvasRef]);
};
