<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Permintaan Perubahan - <?= esc($ticket_number) ?></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0; 
            font-size: 10px;
            color: #000;
            width: 100%; 
        }
        .container {
            width: 100%; 
            border: none; 
            padding: 0; 
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }
        th, td {
            border: 1px solid #000;
            padding: 3px;
            vertical-align: top; 
            text-align: left;
            word-break: break-word; 
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .header-table td {
            border: none;
            font-size: 12px;
        }
        .company-name {
            font-size: 10px;
            font-weight: bold;
        }
        .form-title {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            text-decoration: underline;
        }
        .label {
            font-weight: bold;
        }
        .content { 
             padding: 2px; 
        }
        .erc-options span {
            margin-right: 10px;
        }
        .erc-options input[type="checkbox"] {
            margin-right: 3px;
            vertical-align: middle;
        }
        .erc-options label {
            vertical-align: middle;
        }

        .before-after-cell { 
            vertical-align: top;
        }
        .photo-wrapper { 
            text-align: center;
            margin-bottom: 5px;
        }
        .photo-wrapper img {
            max-width: 95%; 
            max-height: 120px; 
            object-fit: contain;
            border: 1px solid #eee; 
        }
        .description-area { 
            min-height: 250px; 
            padding: 3px;
            overflow: hidden; 
            border: none; 
        }
        .benefit-area { 
            min-height: 80px; 
            padding: 3px;
            overflow: hidden; 
            border: none; 
        }
      
        .signature-section {
            display: grid;
            grid-template-columns: repeat(4, 1fr); 
            gap: 5px;
            margin-top: 5px;
        }
        .signature-box {
            border: 1px solid #000;
            height: 70px; 
            text-align: center;
            padding-top: 5px;
            position: relative;
        }
        .signature-box .label {
            font-size: 9px;
            position: absolute;
            bottom: 3px;
            left: 0;
            right: 0;
        }
        .signature-box img {
            max-height: 40px; 
            max-width: 90%;
            display: block;
            margin: 0 auto 2px auto;
            object-fit: contain;
        }
        .dampak-table td, .validasi-table td {
             height: 15px;
        }
        .dampak-label, .validasi-label {
            width: 60px; 
        }
        .full-width-content {
            min-height: 120px;
        }
        .background-content {
             min-height: 100px; 
        }
        .erc-label {
            width: 20px; 
        }

        @media print {
            body {
                font-size: 9.5px; 
                margin: 0; 
            }
            .container {
                border: none;
                box-shadow: none;
                padding: 0; 
                width: 100%; 
                height: auto; 
            }
            th, td {
                padding: 2px;
                word-break: break-word; 
            }
            .photo-wrapper img {
                max-height: 110px; 
            }
            .description-area {
                 min-height: 200px; 
                 overflow: hidden; 
            }
            .benefit-area {
                 min-height: 80px; 
                 overflow: hidden; 
            }
            .signature-box {
                height: 65px;
            }
            .signature-box img {
                 max-height: 35px;
                 object-fit: contain;
            }
            table, tr, td, th, .signature-section, .signature-box, div, p, span, label, input, img {
                break-inside: avoid !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <table class="header-table" style="margin-bottom: 10px;">
            <tr>
                <td style="width: 70%;" class="company-name">PT Metro Pearl Indonesia</td>
            </tr>
            <tr>
                <td colspan="2" class="form-title" style="padding-top: 5px;">FORM PERMINTAAN PERUBAHAN</td>
            </tr>
        </table>

        <table>
            <tr>
                <td style="width: 15%;"><span class="label">Kaizen Title</span></td>
                <td style="width: 35%;" class="content"><?= esc($kaizen_title) ?></td>
                <td style="width: 15%;"><span class="label">PIC yg mengajukan</span></td>
                <td style="width: 35%;" class="content"><?= esc($pic_name) ?></td>
            </tr>
            <tr>
                <td><span class="label">Usulan</span></td>
                <td class="content"><?= esc($kaizen_title) ?></td>
                <td><span class="label">Department</span></td>
                <td class="content"><?= esc($department) ?></td>
            </tr>
            <tr>
                <td colspan="2" class="erc-options">
                    <span class="label">Pengajuan Perubahan:</span><br>
                    <input type="checkbox" id="erc_e" disabled <?= $kaizen_type === 'Eliminate' ? 'checked' : '' ?>> <label for="erc_e">E (Eliminate)</label>
                    <input type="checkbox" id="erc_r" disabled <?= $kaizen_type === 'Reduce' ? 'checked' : '' ?>> <label for="erc_r">R (Reduce)</label>
                    <input type="checkbox" id="erc_c" disabled <?= $kaizen_type === 'Combine' ? 'checked' : '' ?>> <label for="erc_c">C (Combine)</label>
                    <input type="checkbox" id="erc_s" disabled <?= $kaizen_type === 'Simplified' ? 'checked' : '' ?>> <label for="erc_s">S (Simplified)</label>
                    <br>
                    <input type="checkbox" id="erc_6s" disabled <?= $kaizen_type === '6S' ? 'checked' : '' ?>> <label for="erc_6s">6S</label>
                    <input type="checkbox" id="erc_q" disabled <?= $kaizen_type === 'Quality' ? 'checked' : '' ?>> <label for="erc_q">Q (Quality)</label>
                </td>
                <td><span class="label">Tanggal Pengajuan</span></td>
                <td class="content"><?= esc($submission_date_formatted) ?></td>
            </tr>
            <tr>
                <td colspan="2"><span class="label">SKU/Model Terkait</span></td>
                <td colspan="2" class="content"><?= esc($sku) ?></td>
            </tr>
        </table>

        <table>
            <tr>
                <td style="width: 100%;"><span class="label">Latar Belakang Pengajuan Usulan</span></td>
            </tr>
            <tr>
                <td class="content background-content"><?= nl2br(esc($background)) ?></td>
            </tr>
        </table>

        <table>
            <tr>
                <th style="width:50%;">Before</th>
                <th style="width:50%;">After</th>
            </tr>
            <tr>
                <td class="before-after-cell">
                    <?php if (!empty($photos_before) && isset($photos_before[0])): ?>
                        <div class="photo-wrapper">
                            <img src="<?= base_url($photos_before[0]) ?>" alt="Before Photo 1">
                        </div>
                    <?php endif; ?>
                    <div class="content description-area">
                        <?= nl2br(esc($before_description)) ?>
                    </div>
                </td>
                <td class="before-after-cell">
                    <?php if (!empty($photos_after) && isset($photos_after[0])): ?>
                        <div class="photo-wrapper">
                            <img src="<?= base_url($photos_after[0]) ?>" alt="After Photo 1">
                        </div>
                    <?php endif; ?>
                    <div class="content description-area">
                        <?= nl2br(esc($after_description)) ?>
                    </div>
                </td>
            </tr>
        </table>

        <table>
            <tr>
                <td><span class="label">Benefit</span></td>
            </tr>
            <tr>
                <td>
                    <div class="content benefit-area">
                        <?= nl2br(esc($benefits)) ?>
                    </div>
                </td>
            </tr>
        </table>

        <table>
            <tr>
                <td style="width: 50%; padding:0; border:none;">
                    <table class="dampak-table" style="margin-bottom:0;">
                        <tr><th colspan="2">Dampak</th></tr>
                        <tr><td class="dampak-label"><span class="label">Proses</span></td><td class="content"><?= esc($process_impact) ?></td></tr>
                        <tr><td class="dampak-label"><span class="label">Kualitas</span></td><td class="content"><?= esc($quality_impact) ?></td></tr>
                        <tr><td class="dampak-label"><span class="label">PPH</span></td><td class="content"><?= esc($pph_impact) ?></td></tr>
                        <tr><td class="dampak-label"><span class="label">Cost</span></td><td class="content"><?= esc($cost_impact) ?></td></tr>
                    </table>
                </td>
                <td style="width: 50%; padding:0; border:none;">
                    <table class="validasi-table" style="margin-bottom:0;">
                        <tr><th colspan="2">Test Validasi</th></tr>
                        <tr><td class="validasi-label"><span class="label">Tanggal test</span></td><td class="content"><?= esc($test_date_formatted) ?></td></tr>
                        <tr><td class="validasi-label"><span class="label">Qty test</span></td><td class="content"><?= esc($test_quantity) ?></td></tr>
                        <tr><td class="validasi-label"><span class="label">Hasil test</span></td><td class="content"><?= esc($test_result) ?></td></tr>
                        <tr><td class="validasi-label"><span class="label">Status</span></td><td class="content"><?= esc($validation_status) ?></td></tr>
                    </table>
                </td>
            </tr>
        </table>
        
        <table>
            <tr>
                <td style="width: 15%;"><span class="label">Tim ERC</span></td>
                <td class="content"><?= esc($erc_team) ?></td>
            </tr>
        </table>

        <div style="font-weight: bold; margin-top: 5px; border-bottom: 1px solid #000; padding-bottom: 2px;">Disetujui Oleh:</div>
        <div class="signature-section">
            <div class="signature-box">
                <?php if (!empty($proposers_signature)): ?><img src="<?= $proposers_signature ?>" alt="Proposers Signature"><?php else: ?>&nbsp;<?php endif; ?>
                <span class="label">PIC / Yang Mengajukan</span>
            </div>
            <div class="signature-box">
                <?php if (!empty($spv_production_signature)): ?><img src="<?= $spv_production_signature ?>" alt="SPV Signature"><?php else: ?>&nbsp;<?php endif; ?>
                <span class="label">Supervisor Production</span>
            </div>
            <div class="signature-box">
                <?php if (!empty($kb_production_signature)): ?><img src="<?= $kb_production_signature ?>" alt="KaBag Signature"><?php else: ?>&nbsp;<?php endif; ?>
                <span class="label">Kepala Bagian Produksi</span>
            </div>
            <div class="signature-box">
                <?php if (!empty($asst_manager_production_signature)): ?><img src="<?= $asst_manager_production_signature ?>" alt="Asst. Manager Signature"><?php else: ?>&nbsp;<?php endif; ?>
                <span class="label">Assistant Manager Production</span>
            </div>
            <div class="signature-box">
                <?php if (!empty($manager_production_signature)): ?><img src="<?= $manager_production_signature ?>" alt="Manager Signature"><?php else: ?>&nbsp;<?php endif; ?>
                <span class="label">Manager Production</span>
            </div>
            <div class="signature-box">
                 <?php if (!empty($production_technical_signature)): ?><img src="<?= $production_technical_signature ?>" alt="Prod. Technical Signature"><?php else: ?>&nbsp;<?php endif; ?>
                <span class="label">Production Technical</span>
            </div>
            <div class="signature-box">
                <?php if (!empty($qms_signature)): ?><img src="<?= $qms_signature ?>" alt="QMS Signature"><?php else: ?>&nbsp;<?php endif; ?>
                <span class="label">QMS</span>
            </div>
            <div class="signature-box">
                <?php if (!empty($director_production_signature)): ?><img src="<?= $director_production_signature ?>" alt="Director Signature"><?php else: ?>&nbsp;<?php endif; ?>
                <span class="label">Director Production</span>
            </div>
        </div>
    </div>
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
