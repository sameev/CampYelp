const imagePreview = (event) => {
  const images = document.getElementById('image');
  const number = images.files.length;
  for (let i = 0; i < number; i++) {
    const url = URL.createObjectURL(event.target.files[i]);
    document.getElementById('formFile').innerHTML += `<img class="me-3 rounded" src="${url}">`;
  }
};
