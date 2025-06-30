import React, { useState, useEffect } from "react";
import "./Slider.css";

function Slider({ slides }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 2000);
    return () => clearInterval(slideInterval);
  }, [currentIndex, slides.length]);

  return (
    <div className="slider">
      <div
        className="slide"
        style={{ backgroundImage: `url(${slides[currentIndex]})` }}
      ></div>
      <div className="dots-container">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`dot${idx === currentIndex ? " active" : ""}`}
            onClick={() => goToSlide(idx)}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default Slider;