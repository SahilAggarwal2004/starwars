/* eslint-disable react-hooks/exhaustive-deps */
import { memo, useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim"
import useStorage from "../hooks/useStorage";

export default memo(function ParticleContainer() {
    const [init, setInit] = useStorage('particles-init', false)

    useEffect(() => {
        if (init) return
        // this should be run only once per application lifetime
        initParticlesEngine(async engine => {
            // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
            // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
            // starting from v2 you can add only the features you need reducing the bundle size
            await loadSlim(engine);
        }).then(() => setInit(true));
    }, [])

    return init && <Particles
        id="tsparticles"
        options={{
            background: { color: { value: '#000000' } },
            interactivity: {
                events: {
                    onClick: { enable: true, mode: 'push' },
                    resize: true
                }
            },
            particles: {
                color: { value: '#ffffff' },
                move: {
                    direction: 'none',
                    enable: true,
                    outModes: { default: 'bounce' },
                    speed: 0.5,
                    straight: false,
                },
                number: {
                    density: { enable: true, width: 750, height: 750 },
                    value: 125,
                    limit: 500
                },
                opacity: {
                    animation: { enable: true, speed: 2, count: -1 },
                    value: { min: 0, max: 1 }
                },
                shape: { type: 'circle' },
                size: { value: { min: 1, max: 3 } }
            },
            detectRetina: true
        }}
    />
})