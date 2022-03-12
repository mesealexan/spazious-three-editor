import * as THREE from '../../build/three.module.js';

import { JSZip } from '../../examples/jsm/libs/jszip.module.min.js';

import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';

function MenubarFile(editor) {

	function parseNumber(key, value) {

		var precision = config.getKey('exportPrecision');

		return typeof value === 'number' ? parseFloat(value.toFixed(precision)) : value;

	}

	//

	var config = editor.config;
	var strings = editor.strings;

	var container = new UIPanel();
	container.setClass('menu');

	var title = new UIPanel();
	title.setClass('title');
	title.setTextContent(strings.getKey('menubar/file'));
	container.add(title);

	var options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// New

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/new'));
	option.onClick(function () {

		if (confirm('Any unsaved data will be lost. Are you sure?')) {

			editor.clear();

		}

	});
	options.add(option);

	//

	options.add(new UIHorizontalRule());

	// Import

	var form = document.createElement('form');
	form.style.display = 'none';
	document.body.appendChild(form);

	var fileInput = document.createElement('input');
	fileInput.multiple = true;
	fileInput.type = 'file';
	fileInput.addEventListener('change', function () {

		editor.loader.loadFiles(fileInput.files);
		form.reset();

	});
	form.appendChild(fileInput);

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/import'));
	option.onClick(function () {

		fileInput.click();

	});
	options.add(option);

	//

	options.add(new UIHorizontalRule());

	// Export Geometry

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/geometry'));
	option.onClick(function () {

		var object = editor.selected;

		if (object === null) {

			alert('No object selected.');
			return;

		}

		var geometry = object.geometry;

		if (geometry === undefined) {

			alert('The selected object doesn\'t have geometry.');
			return;

		}

		var output = geometry.toJSON();

		try {

			output = JSON.stringify(output, parseNumber, '\t');
			output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

		} catch (e) {

			output = JSON.stringify(output);

		}

		saveString(output, 'geometry.json');

	});
	options.add(option);

	// Export Object

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/object'));
	option.onClick(function () {

		var object = editor.selected;

		if (object === null) {

			alert('No object selected');
			return;

		}

		var output = object.toJSON();

		try {

			output = JSON.stringify(output, parseNumber, '\t');
			output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

		} catch (e) {

			output = JSON.stringify(output);

		}

		saveString(output, 'model.json');

	});
	options.add(option);

	// Export Scene

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/scene'));
	option.onClick(function () {

		var output = editor.scene.toJSON();

		try {

			output = JSON.stringify(output, parseNumber, '\t');
			output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

		} catch (e) {

			output = JSON.stringify(output);

		}

		saveString(output, 'scene.json');

	});
	options.add(option);

	//

	options.add(new UIHorizontalRule());

	// Export DAE

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/dae'));
	option.onClick(async function () {

		var { ColladaExporter } = await import('../../examples/jsm/exporters/ColladaExporter.js');

		var exporter = new ColladaExporter();

		exporter.parse(editor.scene, function (result) {

			saveString(result.data, 'scene.dae');

		});

	});
	options.add(option);

	// Export DRC

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/drc'));
	option.onClick(async function () {

		var object = editor.selected;

		if (object === null || object.isMesh === undefined) {

			alert('No mesh selected');
			return;

		}

		var { DRACOExporter } = await import('../../examples/jsm/exporters/DRACOExporter.js');

		var exporter = new DRACOExporter();

		// TODO: Change to DRACOExporter's parse( geometry, onParse )?
		var result = exporter.parse(object);
		saveArrayBuffer(result, 'model.drc');

	});
	options.add(option);

	// Export GLB

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/glb'));
	option.onClick(async function () {

		var scene = editor.scene;
		var animations = getAnimations(scene);

		var { GLTFExporter } = await import('../../examples/jsm/exporters/GLTFExporter.js');

		var exporter = new GLTFExporter();

		exporter.parse(scene, function (result) {

			saveArrayBuffer(result, 'scene.glb');

		}, { binary: true, animations: animations });

	});
	options.add(option);

	// Export GLTF

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/gltf'));
	option.onClick(async function () {

		var scene = editor.scene;
		var animations = getAnimations(scene);

		var { GLTFExporter } = await import('../../examples/jsm/exporters/GLTFExporter.js');
		const gltfExporter = new GLTFExporter()
		const options = {
			binary: false,
			trs: false,
			onlyVisible: true,
			truncateDrawRange: true,
			embedImages: false,
			maxTextureSize: Infinity,
			animations: [],
			includeCustomExtensions: false,
		}
		gltfExporter.parse(
			scene,
			function (result) {
				saveStringGLTF('meetingroom.gltf', scene, result)
			},
			function (error) {
				console.log('An error happened during parsing', error)
			},
			//@ts-ignore
			options
		)


	});
	options.add(option);

	// Export OBJ

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/obj'));
	option.onClick(async function () {

		var object = editor.selected;

		if (object === null) {

			alert('No object selected.');
			return;

		}

		var { OBJExporter } = await import('../../examples/jsm/exporters/OBJExporter.js');

		var exporter = new OBJExporter();

		saveString(exporter.parse(object), 'model.obj');

	});
	options.add(option);

	// Export PLY (ASCII)

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/ply'));
	option.onClick(async function () {

		var { PLYExporter } = await import('../../examples/jsm/exporters/PLYExporter.js');

		var exporter = new PLYExporter();

		exporter.parse(editor.scene, function (result) {

			saveArrayBuffer(result, 'model.ply');

		});

	});
	options.add(option);

	// Export PLY (Binary)

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/ply_binary'));
	option.onClick(async function () {

		var { PLYExporter } = await import('../../examples/jsm/exporters/PLYExporter.js');

		var exporter = new PLYExporter();

		exporter.parse(editor.scene, function (result) {

			saveArrayBuffer(result, 'model-binary.ply');

		}, { binary: true });

	});
	options.add(option);

	// Export STL (ASCII)

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/stl'));
	option.onClick(async function () {

		var { STLExporter } = await import('../../examples/jsm/exporters/STLExporter.js');

		var exporter = new STLExporter();

		saveString(exporter.parse(editor.scene), 'model.stl');

	});
	options.add(option);

	// Export STL (Binary)

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/export/stl_binary'));
	option.onClick(async function () {

		var { STLExporter } = await import('../../examples/jsm/exporters/STLExporter.js');

		var exporter = new STLExporter();

		saveArrayBuffer(exporter.parse(editor.scene, { binary: true }), 'model-binary.stl');

	});
	options.add(option);

	//

	options.add(new UIHorizontalRule());

	// Publish

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/file/publish'));
	option.onClick(function () {

		var zip = new JSZip();

		//

		var output = editor.toJSON();
		output.metadata.type = 'App';
		delete output.history;

		output = JSON.stringify(output, parseNumber, '\t');
		output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

		zip.file('app.json', output);

		//

		var title = config.getKey('project/title');

		var manager = new THREE.LoadingManager(function () {

			save(zip.generate({ type: 'blob' }), (title !== '' ? title : 'untitled') + '.zip');

		});

		var loader = new THREE.FileLoader(manager);
		loader.load('js/libs/app/index.html', function (content) {

			content = content.replace('<!-- title -->', title);

			var includes = [];

			content = content.replace('<!-- includes -->', includes.join('\n\t\t'));

			var editButton = '';

			if (config.getKey('project/editable')) {

				editButton = [
					'',
					'			var button = document.createElement( \'a\' );',
					'			button.href = \'https://threejs.org/editor/#file=\' + location.href.split( \'/\' ).slice( 0, - 1 ).join( \'/\' ) + \'/app.json\';',
					'			button.style.cssText = \'position: absolute; bottom: 20px; right: 20px; padding: 10px 16px; color: #fff; border: 1px solid #fff; border-radius: 20px; text-decoration: none;\';',
					'			button.target = \'_blank\';',
					'			button.textContent = \'EDIT\';',
					'			document.body.appendChild( button );',
					''
				].join('\n');

			}

			content = content.replace('\n\t\t\t/* edit button */\n', editButton);

			zip.file('index.html', content);

		});
		loader.load('js/libs/app.js', function (content) {

			zip.file('js/app.js', content);

		});
		loader.load('../build/three.module.js', function (content) {

			zip.file('js/three.module.js', content);

		});
		loader.load('../examples/jsm/webxr/VRButton.js', function (content) {

			zip.file('js/VRButton.js', content);

		});

	});
	options.add(option);

	//

	var link = document.createElement('a');
	function save(blob, filename) {

		link.href = URL.createObjectURL(blob);
		link.download = filename || 'data.json';
		link.dispatchEvent(new MouseEvent('click'));

		// URL.revokeObjectURL( url ); breaks Firefox...

	}

	function saveArrayBuffer(buffer, filename) {

		save(new Blob([buffer], { type: 'application/octet-stream' }), filename);

	}

	function saveString(text, filename) {

		save(new Blob([text], { type: 'text/plain' }), filename);

	}

	function getAnimations(scene) {

		var animations = [];

		scene.traverse(function (object) {

			animations.push(...object.animations);

		});

		return animations;

	}

	function saveStringGLTF(filename, scene, exportedGLTF) {
		console.log(exportedGLTF, window.gltfFile, scene)
		// Objects position map
		for (let i = 0; i < scene.children[0].children.length; i++) {
			for (let j = 0; j < window.gltfFile.nodes.length; j++) {
				if (scene.children[0].children[i].name == window.gltfFile.nodes[j].name) {
					window.gltfFile.nodes[j]["translation"] = [scene.children[0].children[i].position.x, scene.children[0].children[i].position.y, scene.children[0].children[i].position.z]
					window.gltfFile.nodes[j]["rotation"] = [scene.children[0].children[i].quaternion.x, scene.children[0].children[i].quaternion.y, scene.children[0].children[i].quaternion.z, scene.children[0].children[i].quaternion.w]
					window.gltfFile.nodes[j]["scale"] = [scene.children[0].children[i].scale.x, scene.children[0].children[i].scale.y, scene.children[0].children[i].scale.z]
				}
			}
		}
		// Material properties map
		for (let i = 0; i < exportedGLTF.materials.length; i++) {
			for (let j = 0; j < window.gltfFile.materials.length; j++) {
				try{
					if(exportedGLTF.materials[i].name === window.gltfFile.materials[j].name){
						window.gltfFile.materials[j]['pbrMetallicRoughness']['metallicFactor'] = exportedGLTF.materials[i]['pbrMetallicRoughness']['metallicFactor']
							window.gltfFile.materials[j]['pbrMetallicRoughness']['roughnessFactor'] = exportedGLTF.materials[i]['pbrMetallicRoughness']['roughnessFactor']
							window.gltfFile.materials[j]['pbrMetallicRoughness']['baseColorFactor'] = exportedGLTF.materials[i]['pbrMetallicRoughness']['baseColorFactor']
							window.gltfFile.materials[j]['alphaMode'] = exportedGLTF.materials[i]['alphaMode']
							window.gltfFile.materials[j]['doubleSided'] = exportedGLTF.materials[i]['doubleSided']
							window.gltfFile.materials[j]['emissiveFactor'] = exportedGLTF.materials[i]['emissiveFactor']
							window.gltfFile.materials[j]['alphaMode'] = exportedGLTF.materials[i]['alphaMode']
							window.gltfFile.materials[j]['alphaCutoff'] = exportedGLTF.materials[i]['alphaCutoff']
					}
				}
				catch(e){
					console.log(e)
				}
			}
		}

		const output = JSON.stringify(window.gltfFile, null, 2)
		saveGLTF(new Blob([output], { type: 'text/plain' }), filename)
	}

	function saveGLTF(blob, filename) {
		const link = document.createElement('a')
		link.style.display = 'none'
		document.body.appendChild(link)
		link.href = URL.createObjectURL(blob)
		link.download = filename
		link.click()

		// URL.revokeObjectURL( url ); breaks Firefox...
	}


	return container;

}



export { MenubarFile };
