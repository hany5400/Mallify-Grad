Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PWD "assets\images\logo.png"
$dstPath = Join-Path $PWD "assets\images\app logo.png"

try {
    Write-Host "Loading image..."
    $bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
    $width = $bmp.Width
    $height = $bmp.Height

    $minX = $width
    $minY = $height
    $maxX = 0
    $maxY = 0

    Write-Host "Scanning pixels..."
    for ($y = 0; $y -lt $height; $y++) {
        for ($x = 0; $x -lt $width; $x++) {
            $color = $bmp.GetPixel($x, $y)
            if ($color.A -gt 10) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    $cropWidth = $maxX - $minX + 1
    $cropHeight = $maxY - $minY + 1
    
    Write-Host "Original: ${width}x${height}, Cropped content: ${cropWidth}x${cropHeight}"

    $maxDim = $cropWidth
    if ($cropHeight -gt $maxDim) { $maxDim = $cropHeight }

    $bgSize = [int]($maxDim * 1.5) 

    $outBmp = New-Object System.Drawing.Bitmap $bgSize, $bgSize

    $graph = [System.Drawing.Graphics]::FromImage($outBmp)
    $graph.Clear([System.Drawing.Color]::White)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $dstX = [int](($bgSize - $cropWidth) / 2)
    $dstY = [int](($bgSize - $cropHeight) / 2)

    $srcRect = New-Object System.Drawing.Rectangle $minX, $minY, $cropWidth, $cropHeight
    $dstRect = New-Object System.Drawing.Rectangle $dstX, $dstY, $cropWidth, $cropHeight

    Write-Host "Drawing to new canvas $bgSize x $bgSize..."
    $graph.DrawImage($bmp, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    $outBmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $graph.Dispose()
    $bmp.Dispose()
    $outBmp.Dispose()

    Write-Host "Created app_icon.png successfully."
} catch {
    Write-Host "Error: $_"
}
