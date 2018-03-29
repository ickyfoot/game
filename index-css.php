<!DOCTYPE html> <?php // HTML DOCTYPE DECLARATION ?>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en"> <?php // XML DOCUMENT DECLARATION ?>
<head>
	<?php
		$gameRoot = __DIR__;
		$root = realpath(__DIR__. '/..');
		include('includes/game-css-assets.php');
	?>
	<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">     
    <meta name="description" content="">
    <link rel="stylesheet" type="text/css" href="<?= $hashedMainStyle; ?>">
    <link rel="stylesheet" type="text/css" href="<?= $hashedGameStyle; ?>">
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
	<script type="text/javascript" src="<?= $hashedMainJS; ?>"></script>
	<script type="text/javascript" src="<?= $hashedGameJS; ?>"></script>
	<title>Ickyfoot 2.0</title>
</head>
<body>
	<header></header>
	<div id="container">
		<div id="game-board"></div>
	</div> <?php // END #content-container ?>
	<footer></footer>
</body>
</html>