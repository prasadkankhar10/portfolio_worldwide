import math
import random
import struct
import wave
import os

SAMPLE_RATE = 44100

def create_wav(filename, samples):
    # Normalize samples to avoid clipping
    max_amp = max(abs(s) for s in samples) if samples else 1.0
    if max_amp > 0:
        samples = [s / max_amp * 0.85 for s in samples]

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'w') as wav:
        wav.setnchannels(1)  # Mono
        wav.setsampwidth(2)  # 16-bit
        wav.setframerate(SAMPLE_RATE)
        raw_data = bytearray()
        for s in samples:
            val = int(max(-32767, min(32767, s * 32767)))
            raw_data.extend(struct.pack('<h', val))
        wav.writeframes(raw_data)
    print(f"Generated {filename} ({len(samples)} samples, {len(samples)/SAMPLE_RATE:.3f}s)")

def synthesize_wood_step(variation=0):
    duration = 0.085  # 85ms
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    
    # Slight variation per step
    v_pitch = 1.0 + (variation - 1.5) * 0.05
    v_body = 1.0 + (random.random() - 0.5) * 0.08
    
    # 1. Heel strike transient impulse (sharp initial sole impact ~4ms)
    for i in range(min(num_samples, int(SAMPLE_RATE * 0.006))):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 900)
        noise = (random.random() * 2 - 1)
        samples[i] += noise * env * 0.9

    # 2. Wood plank modal cavity resonances
    # Wood boards resonate with 3-4 distinct decaying modes
    modes = [
        (88.0 * v_pitch, 55.0, 0.7 * v_body),    # Deep plank flex
        (165.0 * v_pitch, 80.0, 0.55),            # Board width resonance
        (280.0 * v_pitch, 110.0, 0.4),            # Hollow cavity tap
        (480.0 * v_pitch, 160.0, 0.25)            # Upper wood grain knock
    ]
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        for freq, decay_rate, weight in modes:
            # Damped sinusoidal oscillation with phase offset
            osc = math.sin(2 * math.pi * freq * t)
            decay = math.exp(-decay_rate * t)
            samples[i] += osc * decay * weight

    # 3. Wood grain micro-friction (tread scuff across plank)
    # Filtered random noise decaying rapidly
    scuff_filter = 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = (t / 0.008) * math.exp(-t / 0.014) if t < 0.05 else 0.0
        white = (random.random() * 2 - 1)
        # Lowpass filter the white noise around 650Hz
        scuff_filter = 0.85 * scuff_filter + 0.15 * white
        samples[i] += scuff_filter * env * 0.45

    return samples

def synthesize_grass_step(variation=0):
    duration = 0.095  # 95ms
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    
    v_pitch = 1.0 + (variation - 1.5) * 0.06

    # 1. Soft cushioned soil compression (heavy low-frequency thump)
    modes = [
        (65.0 * v_pitch, 45.0, 0.8),    # Sub-soil compression
        (110.0 * v_pitch, 75.0, 0.5),   # Earth cushion
    ]
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        for freq, decay_rate, weight in modes:
            osc = math.sin(2 * math.pi * freq * t)
            decay = math.exp(-decay_rate * t)
            samples[i] += osc * decay * weight

    # 2. Blade of grass rustle / organic crush (bandpass filtered noise, soft attack)
    bp_filter1 = 0.0
    bp_filter2 = 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Soft attack (4ms), gentle decay (40ms)
        env = (t / 0.006) * math.exp(-t / 0.022)
        white = (random.random() * 2 - 1)
        # Bandpass filter around 1200Hz
        bp_filter1 += (white - bp_filter1) * 0.18
        bp_filter2 += (bp_filter1 - bp_filter2) * 0.18
        samples[i] += (bp_filter1 - bp_filter2) * env * 0.55

    return samples

def synthesize_stone_step(variation=0):
    duration = 0.065  # 65ms (dry, crisp, short)
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    
    v_pitch = 1.0 + (variation - 1.5) * 0.05

    # 1. Sharp sole click (rigid heel contact 2ms)
    for i in range(min(num_samples, int(SAMPLE_RATE * 0.0035))):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 1200)
        samples[i] += (random.random() * 2 - 1) * env * 1.0

    # 2. Hard stone acoustic modes (fast decay, higher frequency)
    modes = [
        (130.0 * v_pitch, 80.0, 0.6),    # Stone mass thump
        (340.0 * v_pitch, 130.0, 0.45),  # Cobblestone knock
        (750.0 * v_pitch, 200.0, 0.3),   # Stone surface click
    ]
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        for freq, decay_rate, weight in modes:
            osc = math.sin(2 * math.pi * freq * t)
            decay = math.exp(-decay_rate * t)
            samples[i] += osc * decay * weight

    # 3. Dry grit friction
    grit_filter = 0.0
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 95)
        white = (random.random() * 2 - 1)
        grit_filter = 0.7 * grit_filter + 0.3 * white
        samples[i] += grit_filter * env * 0.3

    return samples

def main():
    out_dir = "public/audio"
    
    for i in range(4):
        create_wav(f"{out_dir}/step_wood_{i+1}.wav", synthesize_wood_step(i))
        create_wav(f"{out_dir}/step_grass_{i+1}.wav", synthesize_grass_step(i))
        create_wav(f"{out_dir}/step_stone_{i+1}.wav", synthesize_stone_step(i))

if __name__ == "__main__":
    main()
