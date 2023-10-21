function waitForElm(selector) {
  return new Promise((resolve) => {
      let element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else {
        const observer = new MutationObserver((mutations) => {
          let element = document.querySelector(selector)
          if (element) {
            console.log('element ' + selector + ' found');
            resolve(element);
            observer.disconnect();
          }
        });

        observer.observe(document, {
          childList: true,
          subtree: true,
        });
      }

  });
}

export { waitForElm };
