// Fetch all country data
fetch('./data/countries.geojson').then(res => res.json()).then(countries => {
    // Create the 3D globe
    const world = Globe({
            animateIn: false
        })
        .globeImageUrl('./img/earth-blue-marble.jpg')
        .bumpImageUrl('./img/earth-topology.png')
        .backgroundImageUrl('./img/night-sky.png')
        .lineHoverPrecision(0)
        .polygonsData(countries.features.filter(country => country.properties.ISO_A2 !== 'AQ'))
        .polygonAltitude(0.01)
        .polygonCapColor(country => 'transparent')
        .polygonSideColor(country => 'transparent')
        .polygonStrokeColor(country => 'black')
        .polygonLabel(({
            properties: country
        }) => `
          <b>${country.ADMIN} (${country.ISO_A2}):</b> <br />
          GDP: <i>${country.GDP_MD_EST}</i> M$<br/>
          Population: <i>${country.POP_EST}</i>
        `)
        .onPolygonHover(hover => world
            .polygonAltitude(country => country === hover ? 0.01 : 0.001)
            .polygonSideColor(country => country === hover ? '#00000080' : 'transparent')
            .polygonCapColor(country => country === hover ? 'yellow' : 'transparent')
        )
        .polygonsTransitionDuration(300)
        (document.getElementById('globe'));

    // Custom globe material
    const globeMaterial = world.globeMaterial();
    globeMaterial.bumpScale = 10;

    new THREE.TextureLoader().load('./img/earth-water.png', texture => {
        globeMaterial.specularMap = texture;
        globeMaterial.specular = new THREE.Color('grey');
        globeMaterial.shininess = 15;
    });

    // Render cloud sphere over globe

    const cloudImage = './img/clouds.png';
    const cloudAltitude = 0.004;
    const cloudRotationSpeed = -0.006; // Degrees per frame

    new THREE.TextureLoader().load(cloudImage, texture => {
        const clouds = new THREE.Mesh(
            new THREE.SphereBufferGeometry(world.getGlobeRadius() * (1 + cloudAltitude), 75, 75),
            new THREE.MeshPhongMaterial({
                map: texture,
                transparent: true
            })
        );
        world.scene().add(clouds);

        (function rotateClouds() {
            clouds.rotation.y += cloudRotationSpeed * Math.PI / 180;
            requestAnimationFrame(rotateClouds);
        })();
    });
})