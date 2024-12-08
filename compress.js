const fs = require( 'fs' );
const path = require( 'path' );
const zlib = require( 'zlib' );

const sourceDir = path.resolve( __dirname, 'dist/production' );
const outputDir = path.resolve( __dirname, 'dist/compressed' );

function compressFile( inputFilePath, outputFilePath ) {
	const brotli = zlib.createBrotliCompress();
	const input = fs.createReadStream( inputFilePath );
	const output = fs.createWriteStream( outputFilePath );

	input
		.pipe( brotli )
		.pipe( output )
		.on( 'finish', () => {
			console.log( `Compressed: ${inputFilePath} -> ${outputFilePath}` );
		})
		.on( 'error', ( err ) => {
			console.error( `Error compressing ${inputFilePath}:`, err.message );
		});
}

function compressDirectory( directory, outputDirectory ) {
	if ( !fs.existsSync( outputDirectory ) ) {
		fs.mkdirSync( outputDirectory, { recursive: true } );
	}

	fs.readdir( directory, ( err, files ) => {
		if ( err ) {
			console.error( 'Error reading directory:', err.message );
			return;
		}

		files.forEach( ( file ) => {
			const inputFilePath = path.join( directory, file );
			const outputFilePath = path.join( outputDirectory, `${file}.br` );

			fs.stat( inputFilePath, ( err, stats ) => {
				if ( err ) {
					console.error( 'Error getting file stats:', err.message );
					return;
				}

				if ( stats.isFile() && !file.endsWith( '.br' ) ) {
					compressFile( inputFilePath, outputFilePath );
				} else if ( stats.isDirectory() ) {
					// Recursively compress subdirectories
					const subOutputDir = path.join( outputDirectory, file );
					compressDirectory( inputFilePath, subOutputDir );
				}
			});
		});
	});
}

// Start compressing files in the source directory
compressDirectory( sourceDir, outputDir );
