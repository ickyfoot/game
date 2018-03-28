<?php
	// css paths and hashes
	$mainCssPath = '/v2/ui/css/';
	$mainCssWebPath = '/v2/ui/css/';
	$gameCssPath = '/game/ui/css/';
	$gameCssWebPath = '/game/ui/css/';
	$mainStyleFilename = 'style.css';
	$gameStyleFilename = 'game-v0.3.9.css';
	$mainStyleFilePath = $root.$mainCssPath.$mainStyleFilename;
	$gameStyleFilePath = $root.$gameCssPath.$gameStyleFilename;
	$mainStyleHash = (file_exists($mainStyleFilePath)) ? '?'.md5(filemtime($mainStyleFilePath)) : NULL;
	$gameStyleHash = (file_exists($gameStyleFilePath)) ? '?'.md5(filemtime($gameStyleFilePath)) : NULL;
	$hashedMainStyle = $mainCssWebPath.$mainStyleFilename.$mainStyleHash;
	$hashedGameStyle = $gameCssWebPath.$gameStyleFilename.$gameStyleHash;
	
	// js paths and hashes
	$mainJsPath = '/v2/ui/js/';
	$mainJsWebPath = '/v2/ui/js/';
	$gameJsPath = '/game/ui/js/';
	$gameJsWebPath = '/game/ui/js/';
	$mainJsFilename = 'init-v0.4.js';
	$gameJsFilename = 'game-v0.3.6.js';
	$mainJSFilePath = $root.$mainJsPath.$mainJsFilename;
	$gameJSFilePath = $root.$gameJsPath.$gameJsFilename;
	echo $gameJsFilePath.$gameJsFileName;
	$mainJSHash = (file_exists($mainJSFilePath)) ? '?'.md5(filemtime($mainJSFilePath)) : NULL;
	$gameJSHash = (file_exists($gameJSFilePath)) ? '?'.md5(filemtime($gameJSFilePath)) : NULL;
	$hashedMainJS = $mainJsWebPath.$mainJsFilename.$mainJSHash;
	$hashedGameJS = $gameJsWebPath.$gameJsFilename.$gameJSHash;
?>