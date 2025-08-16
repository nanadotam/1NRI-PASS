// Test file for dom-to-image library
// This file can be run in the browser console to test the library

console.log('🧪 Testing dom-to-image library...');

// Test if the library is loaded
if (typeof domtoimage !== 'undefined') {
  console.log('✅ dom-to-image library is loaded successfully');
  console.log('Available methods:', Object.keys(domtoimage));
  
  // Test basic functionality
  const testElement = document.createElement('div');
  testElement.innerHTML = '<h1>Test Element</h1><p>This is a test for dom-to-image</p>';
  testElement.style.cssText = 'padding: 20px; background: white; border: 2px solid black;';
  document.body.appendChild(testElement);
  
  console.log('📝 Test element created:', testElement);
  
  // Test PNG generation
  domtoimage.toPng(testElement)
    .then(function (dataUrl) {
      console.log('✅ PNG generation successful');
      console.log('Data URL length:', dataUrl.length);
      
      // Create a test image to verify
      const img = new Image();
      img.onload = function() {
        console.log('✅ Test image loaded successfully');
        console.log('Image dimensions:', img.width, 'x', img.height);
      };
      img.src = dataUrl;
      
      // Clean up
      document.body.removeChild(testElement);
    })
    .catch(function (error) {
      console.error('❌ PNG generation failed:', error);
      document.body.removeChild(testElement);
    });
    
} else {
  console.error('❌ dom-to-image library not found');
  console.log('Make sure to install: npm install dom-to-image @types/dom-to-image');
}

// Additional test functions
window.testDomToImage = {
  // Test PNG
  testPNG: (element) => {
    return domtoimage.toPng(element);
  },
  
  // Test JPEG
  testJPEG: (element) => {
    return domtoimage.toJpeg(element);
  },
  
  // Test SVG
  testSVG: (element) => {
    return domtoimage.toSvg(element);
  },
  
  // Test Blob
  testBlob: (element) => {
    return domtoimage.toBlob(element);
  },
  
  // Test Canvas
  testCanvas: (element) => {
    return domtoimage.toCanvas(element);
  }
};

console.log('🔧 Test functions available at window.testDomToImage');
console.log('Usage: window.testDomToImage.testPNG(document.body)'); 