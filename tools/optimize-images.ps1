<#
.SYNOPSIS
  Resizes a photo for the website and re-encodes it as JPEG.
  Metadata (including any GPS location from your phone) is stripped.

.EXAMPLE
  .\tools\optimize-images.ps1 -Source Media\vu18-cad.png -Name vu18-cad
  # -> assets\img\vu18-cad-640.jpg and assets\img\vu18-cad-1280.jpg
#>
param(
  [Parameter(Mandatory)] [string]$Source,
  [Parameter(Mandatory)] [string]$Name,
  [int[]]$Widths = @(640, 1280),
  [int]$Quality = 82,
  [string]$OutDir = (Join-Path $PSScriptRoot '..\assets\img')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$src = (Resolve-Path $Source).Path
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)

$img = [System.Drawing.Image]::FromFile($src)
try {
  # Respect the phone's EXIF orientation flag before resizing
  if ($img.PropertyIdList -contains 0x0112) {
    switch ([int]$img.GetPropertyItem(0x0112).Value[0]) {
      3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
      6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
      8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
    }
  }

  $done = @()
  foreach ($target in ($Widths | Sort-Object -Unique)) {
    $w = [Math]::Min($target, $img.Width)
    if ($done -contains $w) { continue }
    $h = [int][Math]::Round($img.Height * $w / $img.Width)

    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Black)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.SmoothingMode = 'HighQuality'
    $g.PixelOffsetMode = 'HighQuality'
    $g.CompositingQuality = 'HighQuality'
    $attr = New-Object System.Drawing.Imaging.ImageAttributes
    $attr.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)

    $out = Join-Path $OutDir ('{0}-{1}.jpg' -f $Name, $w)
    $bmp.Save($out, $jpegCodec, $encParams)
    $g.Dispose(); $bmp.Dispose(); $attr.Dispose()
    $done += $w
    '{0,-40} {1}x{2}  {3:N0} KB' -f (Split-Path $out -Leaf), $w, $h, ((Get-Item $out).Length / 1KB)
  }
}
finally {
  $img.Dispose()
}
