import React, { useEffect, useRef } from 'react';
import './style.css';

const Snowfall = () => {
    const container = useRef();
    useEffect(() => {
        Array.from({ length: 190 }, (_, i) => {
            const leftSnow = Math.floor(Math.random() * i * 25);
            const topSnow = Math.floor(Math.random() * container.current.clientHeight);
            const widthSnow = Math.floor(Math.random() * 25);
            const timeSnow = Math.floor((Math.random() * 5) + 5);

            const div = document.createElement('div');
            div.classList.add('snow');
            div.style.left = leftSnow + 'px';
            div.style.top = topSnow + 'px';
            div.style.width = widthSnow + 'px';
            div.style.height = widthSnow + 'px';
            div.style.animationDuration = timeSnow + 's';
            container.current.appendChild(div);
        })
    }, []);

    return (
        <div ref={container} id="containerfall">

        </div>
    );
};

export default Snowfall;