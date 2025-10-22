// Global variables
let currentKode = '';
let votingStartTime;
let generatedKodes = [];
let customFieldCount = 0;
let currentKodeGroup = null;

// License Management System
let currentLicense = null;
let licenseValid = false;

// License Configuration - SIMPLE & MUDAH DIUBAH
const LICENSE_CONFIG = {
    // KODE PRODUK - bisa diubah sesuai kebutuhan
    PRODUCT_CODE: "VOTING-OSIS-DEMO",
    
    // KODE LISENSI - bisa diubah sesuai kebutuhan
    LICENSE_KEY: "ATTHO-12345-67890-ABCDE-DEMO1",
    
    // TANGGAL BERAKHIR - format: YYYY-MM-DD
    EXPIRY_DATE: "2026-10-23"
};

// Simple License System
function initializeLicenseSystem() {
    checkStoredLicense();
    updateLicenseUI();
}

function checkStoredLicense() {
    const storedLicense = localStorage.getItem('voting_system_license');
    if (storedLicense) {
        try {
            currentLicense = JSON.parse(storedLicense);
            validateStoredLicense();
        } catch (e) {
            console.error('Error parsing stored license:', e);
            localStorage.removeItem('voting_system_license');
        }
    }
}

function validateStoredLicense() {
    if (!currentLicense) return false;
    
    const now = new Date();
    const expiryDate = new Date(currentLicense.expiryDate);
    
    if (now > expiryDate) {
        currentLicense.status = 'expired';
        licenseValid = false;
        saveLicense();
        return false;
    }
    
    licenseValid = currentLicense.status === 'active';
    return licenseValid;
}

function validateLicense() {
    const licenseKey = document.getElementById('license-key').value.trim().toUpperCase();
    
    if (!licenseKey) {
        showLicenseAlert('error', 'Kode lisensi tidak boleh kosong');
        return;
    }

    // Show loading
    const validateBtn = document.getElementById('validate-btn');
    const originalText = validateBtn.innerHTML;
    validateBtn.disabled = true;
    validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Memvalidasi...';

    // Simple validation - hanya cocokkan dengan kode di config
    setTimeout(() => {
        if (licenseKey === LICENSE_CONFIG.LICENSE_KEY) {
            const expiryDate = new Date(LICENSE_CONFIG.EXPIRY_DATE);
            
            currentLicense = {
                licenseKey: licenseKey,
                productCode: LICENSE_CONFIG.PRODUCT_CODE,
                status: 'active',
                activationDate: new Date().toISOString(),
                expiryDate: expiryDate.toISOString(),
                licenseType: 'DEMO'
            };
            
            licenseValid = true;
            saveLicense();
            updateLicenseUI();
            
            showLicenseAlert('success', 
                `Lisensi berhasil diaktivasi!<br>
                 Berlaku hingga: ${expiryDate.toLocaleDateString('id-ID')}`
            );
            
            // Enable features
            enableApplicationFeatures();
            
        } else {
            showLicenseAlert('error', 'Kode lisensi tidak valid!');
        }
        
        validateBtn.disabled = false;
        validateBtn.innerHTML = originalText;
    }, 1000);
}

function updateLicenseUI() {
    const statusCard = document.getElementById('license-status-card');
    const statusText = document.getElementById('license-status-text');
    const expiryText = document.getElementById('license-expiry');
    const typeText = document.getElementById('license-type');
    const daysLeftText = document.getElementById('license-days-left');
    
    if (!currentLicense) {
        statusCard.className = 'license-status-card p-3 rounded bg-light';
        statusText.innerHTML = '<span class="badge bg-secondary">Belum Diaktivasi</span>';
        expiryText.textContent = '-';
        typeText.textContent = '-';
        daysLeftText.textContent = '-';
        return;
    }
    
    const now = new Date();
    const expiryDate = new Date(currentLicense.expiryDate);
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    // Update status display
    if (currentLicense.status === 'active' && daysLeft > 0) {
        if (daysLeft > 30) {
            statusCard.className = 'license-status-card p-3 rounded bg-success bg-opacity-20';
            statusText.innerHTML = '<span class="badge bg-success">Aktif</span>';
        } else if (daysLeft > 7) {
            statusCard.className = 'license-status-card p-3 rounded bg-warning bg-opacity-20';
            statusText.innerHTML = '<span class="badge bg-warning">Aktif</span>';
        } else {
            statusCard.className = 'license-status-card p-3 rounded bg-danger bg-opacity-20';
            statusText.innerHTML = '<span class="badge bg-danger">Aktif</span>';
        }
    } else {
        statusCard.className = 'license-status-card p-3 rounded bg-danger bg-opacity-20';
        statusText.innerHTML = '<span class="badge bg-danger">Tidak Aktif</span>';
    }
    
    expiryText.textContent = expiryDate.toLocaleDateString('id-ID');
    typeText.textContent = 'DEMO';
    daysLeftText.textContent = daysLeft > 0 ? `${daysLeft} hari` : 'Kedaluwarsa';
}

function saveLicense() {
    if (currentLicense) {
        localStorage.setItem('voting_system_license', JSON.stringify(currentLicense));
    } else {
        localStorage.removeItem('voting_system_license');
    }
}

function showLicenseAlert(icon, message) {
    Swal.fire({
        icon: icon,
        title: 'Status Lisensi',
        html: message,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
    });
}

function checkLicenseStatus() {
    if (!currentLicense) {
        showLicenseAlert('info', 'Tidak ada lisensi yang aktif. Silakan masukkan kode lisensi.');
        return;
    }
    
    const now = new Date();
    const expiryDate = new Date(currentLicense.expiryDate);
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    let statusMessage = '';
    let icon = 'info';
    
    if (currentLicense.status === 'active') {
        if (daysLeft > 30) {
            statusMessage = `✅ Lisensi aktif<br>Berlaku hingga: ${expiryDate.toLocaleDateString('id-ID')}<br>Sisa: ${daysLeft} hari`;
            icon = 'success';
        } else if (daysLeft > 7) {
            statusMessage = `⚠️ Lisensi aktif<br>Berlaku hingga: ${expiryDate.toLocaleDateString('id-ID')}<br>Sisa: ${daysLeft} hari`;
            icon = 'warning';
        } else if (daysLeft > 0) {
            statusMessage = `🚨 Lisensi aktif<br>Berlaku hingga: ${expiryDate.toLocaleDateString('id-ID')}<br>Sisa: ${daysLeft} hari!`;
            icon = 'error';
        } else {
            statusMessage = `❌ Lisensi kedaluwarsa pada ${expiryDate.toLocaleDateString('id-ID')}`;
            icon = 'error';
        }
    }
    
    showLicenseAlert(icon, statusMessage);
}

function resetLicenseSystem() {
    Swal.fire({
        title: 'Reset Sistem Lisensi?',
        html: `Semua data lisensi akan dihapus dan sistem akan dikunci`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Reset!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.isConfirmed) {
            currentLicense = null;
            licenseValid = false;
            localStorage.removeItem('voting_system_license');
            updateLicenseUI();
            disableApplicationFeatures();
            
            showLicenseAlert('success', 'Sistem lisensi berhasil direset');
        }
    });
}

// Feature locking functions (tetap sama)
function enableApplicationFeatures() {
    document.querySelectorAll('.menu-card').forEach(card => {
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        card.style.cursor = 'pointer';
    });
    
    document.querySelectorAll('.admin-nav .nav-link').forEach(link => {
        link.style.opacity = '1';
        link.style.pointerEvents = 'auto';
    });
    
    document.querySelectorAll('.license-warning').forEach(warning => {
        warning.remove();
    });
}

function disableApplicationFeatures() {
    document.querySelectorAll('.menu-card').forEach(card => {
        if (!card.querySelector('i.fa-cog')) {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
            card.style.cursor = 'not-allowed';
            
            if (!card.querySelector('.license-warning')) {
                const warning = document.createElement('div');
                warning.className = 'license-warning badge bg-danger position-absolute';
                warning.style.top = '10px';
                warning.style.right = '10px';
                warning.innerHTML = '<i class="fas fa-lock me-1"></i> Terkunci';
                card.style.position = 'relative';
                card.appendChild(warning);
            }
        }
    });
    
    document.querySelectorAll('.admin-nav .nav-link').forEach(link => {
        if (!link.querySelector('i.fa-cog')) {
            link.style.opacity = '0.5';
            link.style.pointerEvents = 'none';
        }
    });
}

function checkLicenseAndLockFeatures() {
    if (!licenseValid) {
        disableApplicationFeatures();
        
        if (document.getElementById('main-menu').classList.contains('active-section')) {
            setTimeout(() => {
                if (!licenseValid) {
                    showLicenseRequiredModal();
                }
            }, 1000);
        }
    } else {
        enableApplicationFeatures();
    }
}

function showLicenseRequiredModal() {
    if (!document.getElementById('license-required-modal')) {
        const modalHTML = `
            <div class="modal fade" id="license-required-modal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-warning text-dark">
                            <h5 class="modal-title"><i class="fas fa-key me-2"></i> Lisensi Diperlukan</h5>
                        </div>
                        <div class="modal-body text-center">
                            <i class="fas fa-lock fa-4x text-warning mb-3"></i>
                            <h4>Akses Dibatasi</h4>
                            <p class="text-muted">
                                Sistem memerlukan lisensi yang valid untuk mengakses fitur voting dan administrasi.
                            </p>
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                Silakan buka menu <strong>Settings</strong> untuk memasukkan kode lisensi.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="showSection('admin-section'); showAdminTab('settings-tab'); bootstrap.Modal.getInstance(document.getElementById('license-required-modal')).hide();">
                                <i class="fas fa-cog me-2"></i> Buka Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = new bootstrap.Modal(document.getElementById('license-required-modal'));
        modal.show();
    }
}

// Toggle license key visibility
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggle-license-visibility');
    const licenseInput = document.getElementById('license-key');
    
    if (toggleBtn && licenseInput) {
        toggleBtn.addEventListener('click', function() {
            const type = licenseInput.getAttribute('type') === 'password' ? 'text' : 'password';
            licenseInput.setAttribute('type', type);
            toggleBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Initialize license system
    initializeLicenseSystem();
    checkLicenseAndLockFeatures();
});

// Update the showSection function to check license
const originalShowSection = showSection;
showSection = function(sectionId) {
    // Always allow access to main-menu and admin-section (settings tab)
    if (sectionId === 'main-menu' || sectionId === 'admin-section') {
        originalShowSection(sectionId);
        return;
    }
    
    // Check license for other sections
    if (!licenseValid && sectionId !== 'voting-section') {
        showLicenseRequiredModal();
        return;
    }
    
    originalShowSection(sectionId);
};

// Update the showAdminTab function to check license
const originalShowAdminTab = showAdminTab;
showAdminTab = function(tabId) {
    // Always allow access to settings tab
    if (tabId === 'settings-tab') {
        originalShowAdminTab(tabId);
        return;
    }
    
    // Check license for other tabs
    if (!licenseValid) {
        showLicenseRequiredModal();
        return;
    }
    
    originalShowAdminTab(tabId);
};

// SweetAlert Configuration
const Swal = window.Swal;

// Navigation functions
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active-section');
    });
    document.getElementById(sectionId).classList.add('active-section');
    
    // Show/hide timer and fullscreen button
    if (sectionId === 'voting-section') {
        document.getElementById('voting-timer').style.display = 'none';
        document.querySelector('.fullscreen-btn').style.display = 'none';
        resetVoting();
    } else {
        document.getElementById('voting-timer').style.display = 'none';
        document.querySelector('.fullscreen-btn').style.display = 'none';
    }
}

function showAdminTab(tabId) {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
    
    // Update active nav link
    document.querySelectorAll('.admin-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load data for specific tabs
    if (tabId === 'riwayat-kode-tab') {
        loadKodeGroups();
    } else if (tabId === 'hasil-tab') {
        loadResults();
    }
}

// Fullscreen function
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Timer functions
function startVotingTimer() {
    votingStartTime = new Date();
    document.getElementById('voting-timer').style.display = 'block';
    document.querySelector('.fullscreen-btn').style.display = 'block';
    updateVotingTimer();
    setInterval(updateVotingTimer, 1000);
}

function updateVotingTimer() {
    if (!votingStartTime) return;
    const now = new Date();
    const diff = new Date(now - votingStartTime);
    const hours = diff.getUTCHours().toString().padStart(2, '0');
    const minutes = diff.getUTCMinutes().toString().padStart(2, '0');
    const seconds = diff.getUTCSeconds().toString().padStart(2, '0');
    document.getElementById('timer-display').textContent = `${hours}:${minutes}:${seconds}`;
}

// Kode verification dengan SweetAlert - FIXED
function verifyKode() {
    const kode = document.getElementById('kode-input').value.trim().toUpperCase();
    const errorElement = document.getElementById('kode-error');
    
    if (!kode) {
        showError('Harap masukkan kode voting');
        return;
    }

    // Show loading
    Swal.fire({
        title: 'Memverifikasi Kode...',
        text: 'Sedang memeriksa kode voting',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    database.ref('kodeUnik/' + kode).once('value').then((snapshot) => {
        Swal.close(); // Tutup loading
        
        if (snapshot.exists()) {
            const kodeData = snapshot.val();
            if (kodeData.status === 'active') {
                currentKode = kode;
                
                // Tandai kode sebagai digunakan
                database.ref('kodeUnik/' + kode).update({
                    status: 'used',
                    usedAt: new Date().toISOString()
                }).then(() => {
                    // Show success alert dan langsung lanjut ke voting
                    Swal.fire({
                        icon: 'success',
                        title: 'Kode Valid!',
                        text: 'Silakan pilih calon ketua OSIS',
                        confirmButtonText: 'Lanjutkan',
                        confirmButtonColor: '#3085d6',
                        backdrop: 'rgba(0,0,0,0.4)'
                    }).then((result) => {
                        // LANGSUNG KE HALAMAN VOTING TANPA TUNGGU KONFIRMASI
                        showVotingPage();
                    });
                }).catch(error => {
                    console.error('Error updating kode status:', error);
                    // Tetap lanjut ke voting meski update status gagal
                    showVotingPage();
                });
                
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Kode Sudah Digunakan',
                    text: 'Kode ini sudah digunakan untuk voting',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Kode Tidak Valid',
                text: 'Kode voting yang dimasukkan tidak valid',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        }
    }).catch((error) => {
        Swal.close();
        console.error('Error verifying kode:', error);
        Swal.fire({
            icon: 'error',
            title: 'Terjadi Kesalahan',
            text: 'Gagal memverifikasi kode, coba lagi',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33'
        });
    });

    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Fungsi baru untuk menampilkan halaman voting
function showVotingPage() {
    document.getElementById('kode-input-section').style.display = 'none';
    document.getElementById('kandidat-section').style.display = 'block';
    loadCandidates();
    startVotingTimer();
    
    // Scroll ke atas untuk memastikan kandidat terlihat
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load candidates for voting dengan SweetAlert
function loadCandidates() {
    database.ref('candidates').on('value', (snapshot) => {
        const candidates = snapshot.val();
        const container = document.getElementById('candidates-container');
        container.innerHTML = '';

        if (candidates) {
            Object.keys(candidates).forEach(key => {
                const candidate = candidates[key];
                const candidateElement = document.createElement('div');
                candidateElement.className = 'col-md-6 col-lg-4';
                candidateElement.innerHTML = `
                    <div class="card candidate-card">
                        <div class="candidate-photo">
                            <img src="${candidate.foto || 'https://via.placeholder.com/300x200?text=Foto+Kandidat'}" 
                                 alt="${candidate.nama}" 
                                 onerror="this.src='https://via.placeholder.com/300x200?text=Foto+Kandidat'">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title text-primary">${candidate.nama}</h5>
                            <div class="visi-misi">
                                <p class="mb-2"><strong>Visi:</strong> ${candidate.visi || '-'}</p>
                                <p class="mb-3"><strong>Misi:</strong> ${candidate.misi || '-'}</p>
                            </div>
                            ${candidate.customFields ? Object.entries(candidate.customFields).map(([field, value]) => 
                                `<p class="mb-1"><strong>${field}:</strong> ${value}</p>`
                            ).join('') : ''}
                            <button class="btn vote-btn w-100 mt-3" onclick="voteForCandidate('${key}', '${candidate.nama}')">
                                <i class="fas fa-vote-yea me-2"></i> PILIH
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(candidateElement);
            });
        } else {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i> Belum ada kandidat yang terdaftar
                    </div>
                </div>
            `;
        }
    });
}

// Vote for candidate dengan auto redirect
function voteForCandidate(candidateId, candidateName) {
    if (!currentKode) return;

    Swal.fire({
        title: 'Konfirmasi Pilihan',
        html: `
            <div class="text-center">
                <i class="fas fa-vote-yea fa-3x text-primary mb-3"></i>
                <h5>Apakah Anda yakin memilih:</h5>
                <h4 class="text-success">${candidateName}</h4>
                <p class="text-muted mt-2">Pilihan tidak dapat diubah setelah dikonfirmasi</p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Saya Yakin!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#27ae60',
        cancelButtonColor: '#95a5a6',
        backdrop: 'rgba(0,0,0,0.4)',
        customClass: {
            confirmButton: 'btn btn-success px-4 py-2',
            cancelButton: 'btn btn-secondary px-4 py-2'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Show loading
            Swal.fire({
                title: 'Memproses Vote...',
                text: 'Sedang menyimpan pilihan Anda',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Update vote count
            database.ref('votes/' + candidateId).transaction((currentVotes) => {
                return (currentVotes || 0) + 1;
            }).then(() => {
                // Record user vote
                return database.ref('userVotes/' + currentKode).set({
                    candidateId: candidateId,
                    candidateName: candidateName,
                    votedAt: new Date().toISOString(),
                    kode: currentKode
                });
            }).then(() => {
                // TUTUP LOADING DAN LANGSUNG TAMPILKAN SUKSES
                Swal.close();
                
                // Tampilkan notifikasi sukses dengan timer auto close
                Swal.fire({
                    icon: 'success',
                    title: 'Vote Berhasil!',
                    html: `
                        <div class="text-center">
                            <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
                            <h4>Terima kasih telah menggunakan hak pilih Anda</h4>
                            <p class="text-muted">Pilihan Anda untuk <strong>${candidateName}</strong> telah tercatat</p>
                            <div class="mt-4">
                                <div class="spinner-border text-primary spinner-border-sm me-2" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <small class="text-muted">Otomatis kembali dalam <span id="countdown">3</span> detik...</small>
                            </div>
                        </div>
                    `,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    backdrop: 'rgba(0,0,0,0.4)',
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: () => {
                        // Countdown timer
                        let timeLeft = 3;
                        const countdownElement = document.getElementById('countdown');
                        const timerInterval = setInterval(() => {
                            timeLeft--;
                            if (countdownElement) {
                                countdownElement.textContent = timeLeft;
                            }
                            if (timeLeft <= 0) {
                                clearInterval(timerInterval);
                            }
                        }, 1000);
                    }
                }).then(() => {
                    // Setelah timer selesai, langsung redirect
                    resetVoting();
                    showSection('voting-section');
                });
                
            }).catch((error) => {
                Swal.close();
                console.error('Error voting:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Memproses',
                    text: 'Terjadi kesalahan saat menyimpan pilihan',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
            });
        }
    });
}

function resetVoting() {
    currentKode = '';
    document.getElementById('kode-input').value = '';
    document.getElementById('kode-input-section').style.display = 'block';
    document.getElementById('kandidat-section').style.display = 'none';
    document.getElementById('voting-timer').style.display = 'none';
    document.querySelector('.fullscreen-btn').style.display = 'none';
}

// Admin functions
function addCustomField() {
    customFieldCount++;
    const container = document.getElementById('custom-fields-container');
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'custom-field';
    fieldDiv.innerHTML = `
        <div class="row g-2">
            <div class="col-md-5">
                <input type="text" class="form-control" placeholder="Nama Field" 
                       id="custom-field-name-${customFieldCount}" style="border-radius: 10px;">
            </div>
            <div class="col-md-5">
                <input type="text" class="form-control" placeholder="Value" 
                       id="custom-field-value-${customFieldCount}" style="border-radius: 10px;">
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger w-100" onclick="removeCustomField(this)" style="border-radius: 10px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(fieldDiv);
}

function removeCustomField(button) {
    button.closest('.custom-field').remove();
}

function addKandidat() {
    const nama = document.getElementById('nama-kandidat').value;
    const foto = document.getElementById('foto-kandidat').value;
    const visi = document.getElementById('visi-kandidat').value;
    const misi = document.getElementById('misi-kandidat').value;

    if (!nama || !foto || !visi || !misi) {
        Swal.fire({
            icon: 'warning',
            title: 'Data Belum Lengkap',
            text: 'Harap isi semua field yang wajib!',
            confirmButtonText: 'OK',
            confirmButtonColor: '#f39c12'
        });
        return;
    }

    // Collect custom fields
    const customFields = {};
    document.querySelectorAll('.custom-field').forEach(field => {
        const nameInput = field.querySelector('input[placeholder="Nama Field"]');
        const valueInput = field.querySelector('input[placeholder="Value"]');
        if (nameInput.value && valueInput.value) {
            customFields[nameInput.value] = valueInput.value;
        }
    });

    const candidateData = {
        nama: nama,
        foto: foto,
        visi: visi,
        misi: misi,
        customFields: customFields,
        createdAt: new Date().toISOString()
    };

    const candidateId = 'CAND-' + Date.now();
    
    // Show loading
    Swal.fire({
        title: 'Menyimpan Kandidat...',
        text: 'Sedang menambahkan kandidat baru',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    database.ref('candidates/' + candidateId).set(candidateData)
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Kandidat berhasil ditambahkan',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
            document.getElementById('kandidatForm').reset();
            document.getElementById('custom-fields-container').innerHTML = '';
            customFieldCount = 0;
            const modal = bootstrap.Modal.getInstance(document.getElementById('kandidatModal'));
            modal.hide();
            loadAdminCandidates();
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: 'Error: ' + error.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        });
}

function loadAdminCandidates() {
    database.ref('candidates').on('value', (snapshot) => {
        const candidates = snapshot.val();
        const container = document.getElementById('admin-candidates-container');
        container.innerHTML = '';

        if (candidates) {
            Object.keys(candidates).forEach(key => {
                const candidate = candidates[key];
                const candidateElement = document.createElement('div');
                candidateElement.className = 'col-md-6 col-lg-4';
                candidateElement.innerHTML = `
                    <div class="card candidate-card">
                        <div class="candidate-photo">
                            <img src="${candidate.foto || 'https://via.placeholder.com/300x200?text=Foto+Kandidat'}" 
                                 alt="${candidate.nama}">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title text-primary">${candidate.nama}</h5>
                            <div class="visi-misi">
                                <p class="mb-2"><strong>Visi:</strong> ${candidate.visi}</p>
                                <p class="mb-3"><strong>Misi:</strong> ${candidate.misi}</p>
                            </div>
                            ${candidate.customFields ? Object.entries(candidate.customFields).map(([field, value]) => 
                                `<p class="mb-1"><strong>${field}:</strong> ${value}</p>`
                            ).join('') : ''}
                            <button class="btn btn-danger btn-sm w-100 mt-3" onclick="deleteCandidate('${key}', '${candidate.nama}')" style="border-radius: 10px;">
                                <i class="fas fa-trash me-2"></i> Hapus
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(candidateElement);
            });
        } else {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i> Belum ada kandidat
                    </div>
                </div>
            `;
        }
    });
}

function deleteCandidate(candidateId, candidateName) {
    Swal.fire({
        title: 'Hapus Kandidat?',
        html: `Apakah Anda yakin ingin menghapus kandidat <strong>${candidateName}</strong>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        backdrop: 'rgba(0,0,0,0.4)'
    }).then((result) => {
        if (result.isConfirmed) {
            database.ref('candidates/' + candidateId).remove()
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Terhapus!',
                        text: 'Kandidat berhasil dihapus',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3085d6'
                    });
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal!',
                        text: 'Error: ' + error.message,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#d33'
                    });
                });
        }
    });
}

// Generate kodes dengan prefix
function generateKodes() {
    const prefix = document.getElementById('kode-prefix').value.trim().toUpperCase() || 'A';
    const count = parseInt(document.getElementById('kode-count').value) || 10;
    const groupName = document.getElementById('kode-group-name').value.trim() || `Grup ${prefix}`;
    
    if (count < 1 || count > 1000) {
        Swal.fire({
            icon: 'warning',
            title: 'Jumlah Tidak Valid',
            text: 'Jumlah kode harus antara 1-1000',
            confirmButtonText: 'OK',
            confirmButtonColor: '#f39c12'
        });
        return;
    }

    generatedKodes = [];
    currentKodeGroup = {
        prefix: prefix,
        count: count,
        groupName: groupName,
        createdAt: new Date().toISOString(),
        kodes: []
    };

    for (let i = 1; i <= count; i++) {
        const kode = prefix + i;
        const kodeData = {
            kode: kode,
            status: 'active',
            createdAt: new Date().toISOString(),
            prefix: prefix,
            groupName: groupName
        };
        
        generatedKodes.push(kodeData);
        currentKodeGroup.kodes.push(kodeData);
    }

    updateKodePreview();
    document.getElementById('save-btn').disabled = false;
    document.getElementById('cancel-btn').disabled = false;
    document.getElementById('download-btn').disabled = false;
    document.getElementById('print-btn').disabled = false;

    Swal.fire({
        icon: 'success',
        title: 'Kode Digenerate!',
        html: `
            <div class="text-center">
                <i class="fas fa-magic fa-3x text-success mb-3"></i>
                <h5>${count} kode berhasil digenerate</h5>
                <p class="text-muted">Prefix: <strong>${prefix}</strong></p>
                <p class="text-muted">Klik "Simpan Kode" untuk menyimpan ke database</p>
            </div>
        `,
        confirmButtonText: 'Mengerti',
        confirmButtonColor: '#3085d6'
    });
}

function saveKodes() {
    if (generatedKodes.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Tidak Ada Kode',
            text: 'Generate kode terlebih dahulu',
            confirmButtonText: 'OK',
            confirmButtonColor: '#f39c12'
        });
        return;
    }

    Swal.fire({
        title: 'Menyimpan Kode...',
        text: 'Sedang menyimpan kode ke database',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const batch = {};
    generatedKodes.forEach(kodeData => {
        batch[kodeData.kode] = {
            status: kodeData.status,
            createdAt: kodeData.createdAt,
            prefix: kodeData.prefix,
            groupName: kodeData.groupName
        };
    });

    // Save kode group
    const groupId = 'GROUP-' + Date.now();
    database.ref('kodeGroups/' + groupId).set(currentKodeGroup)
        .then(() => {
            // Save individual codes
            return database.ref('kodeUnik').update(batch);
        })
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Tersimpan!',
                html: `
                    <div class="text-center">
                        <i class="fas fa-save fa-3x text-success mb-3"></i>
                        <h5>${generatedKodes.length} kode berhasil disimpan</h5>
                        <p class="text-muted">Grup: <strong>${currentKodeGroup.groupName}</strong></p>
                    </div>
                `,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
            
            // Reset buttons
            document.getElementById('save-btn').disabled = true;
            document.getElementById('cancel-btn').disabled = true;
            generatedKodes = [];
            currentKodeGroup = null;
            updateKodePreview();
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: 'Error: ' + error.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        });
}

function cancelGenerate() {
    Swal.fire({
        title: 'Batalkan Generate?',
        text: 'Semua kode yang telah digenerate akan hilang',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Batalkan!',
        cancelButtonText: 'Lanjutkan',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.isConfirmed) {
            generatedKodes = [];
            currentKodeGroup = null;
            updateKodePreview();
            document.getElementById('save-btn').disabled = true;
            document.getElementById('cancel-btn').disabled = true;
            document.getElementById('download-btn').disabled = true;
            document.getElementById('print-btn').disabled = true;
            
            Swal.fire({
                icon: 'info',
                title: 'Dibatalkan',
                text: 'Generate kode telah dibatalkan',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
        }
    });
}

function updateKodePreview() {
    const preview = document.getElementById('kode-preview');
    preview.innerHTML = '';

    if (generatedKodes.length === 0) {
        preview.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i> Belum ada kode yang digenerate
                </div>
            </div>
        `;
        return;
    }

    const firstTen = generatedKodes.slice(0, 10);
    firstTen.forEach(item => {
        const kodeElement = document.createElement('div');
        kodeElement.className = 'col-md-6 col-lg-4';
        kodeElement.innerHTML = `
            <div class="kode-item">
                <div class="d-flex justify-content-between align-items-center">
                    <span>${item.kode}</span>
                    <span class="badge bg-success">${item.status}</span>
                </div>
            </div>
        `;
        preview.appendChild(kodeElement);
    });

    if (generatedKodes.length > 10) {
        const moreElement = document.createElement('div');
        moreElement.className = 'col-12 text-center';
        moreElement.innerHTML = `
            <div class="alert alert-secondary">
                <i class="fas fa-ellipsis-h me-2"></i>
                Dan ${generatedKodes.length - 10} kode lainnya...
            </div>
        `;
        preview.appendChild(moreElement);
    }
}

function downloadKodes() {
    if (generatedKodes.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Tidak Ada Kode',
            text: 'Tidak ada kode untuk didownload',
            confirmButtonText: 'OK',
            confirmButtonColor: '#f39c12'
        });
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(generatedKodes.map(k => ({ 
        'Kode': k.kode, 
        'Status': k.status,
        'Prefix': k.prefix,
        'Grup': k.groupName
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kode Voting");
    XLSX.writeFile(workbook, `kode_voting_${currentKodeGroup.prefix}_${Date.now()}.xlsx`);
    
    Swal.fire({
        icon: 'success',
        title: 'Terdownload!',
        text: 'File Excel berhasil didownload',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
    });
}

function printKodes() {
    if (generatedKodes.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Tidak Ada Kode',
            text: 'Tidak ada kode untuk dicetak',
            confirmButtonText: 'OK',
            confirmButtonColor: '#f39c12'
        });
        return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Kode Voting OSIS AT-THOHARIYAH</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 30px; 
                        background: #f8f9fa;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 40px;
                        background: white;
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    }
                    .kode-list { 
                        display: grid; 
                        grid-template-columns: repeat(4, 1fr); 
                        gap: 15px;
                        margin-top: 20px;
                    }
                    .kode-item { 
                        padding: 20px; 
                        border: 2px solid #333; 
                        text-align: center; 
                        font-weight: bold;
                        font-size: 1.2rem;
                        background: white;
                        border-radius: 10px;
                    }
                    .group-info {
                        background: #e9ecef;
                        padding: 20px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                    }
                    @media print {
                        body { margin: 0; background: white; }
                        .kode-item { border: 2px solid #000; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Kode Voting OSIS</h1>
                    <h2>AT-THOHARIYAH</h2>
                </div>
                <div class="group-info">
                    <h3>Informasi Grup</h3>
                    <p><strong>Nama Grup:</strong> ${currentKodeGroup.groupName}</p>
                    <p><strong>Prefix:</strong> ${currentKodeGroup.prefix}</p>
                    <p><strong>Jumlah Kode:</strong> ${generatedKodes.length}</p>
                    <p><strong>Tanggal Generate:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
                </div>
                <div class="kode-list">
                    ${generatedKodes.map(item => 
                        `<div class="kode-item">${item.kode}</div>`
                    ).join('')}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    }
                <\/script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// Load kode groups untuk riwayat
function loadKodeGroups() {
    database.ref('kodeGroups').on('value', (snapshot) => {
        const groups = snapshot.val();
        const container = document.getElementById('kode-groups-container');
        container.innerHTML = '';

        if (groups) {
            Object.keys(groups).reverse().forEach(key => {
                const group = groups[key];
                const usedCount = group.kodes ? group.kodes.filter(k => k.status === 'used').length : 0;
                const activeCount = group.kodes ? group.kodes.length - usedCount : 0;
                
                const groupElement = document.createElement('div');
                groupElement.className = 'col-md-6 col-lg-4';
                groupElement.innerHTML = `
                    <div class="kode-group-card">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="text-primary">${group.groupName}</h5>
                            <span class="badge bg-primary">${group.kodes ? group.kodes.length : 0} kode</span>
                        </div>
                        <div class="mb-3">
                            <p class="mb-1"><strong>Prefix:</strong> ${group.prefix}</p>
                            <p class="mb-1"><strong>Dibuat:</strong> ${new Date(group.createdAt).toLocaleDateString('id-ID')}</p>
                            <p class="mb-1"><strong>Status:</strong> 
                                <span class="badge ${usedCount > 0 ? 'bg-warning' : 'bg-success'}">
                                    ${usedCount > 0 ? usedCount + ' digunakan' : 'Semua Aktif'}
                                </span>
                            </p>
                            <p class="mb-0"><strong>Aktif:</strong> ${activeCount} kode</p>
                        </div>
                        <div class="kode-preview-small">
                            ${group.kodes ? group.kodes.slice(0, 5).map(kode => 
                                `<span class="badge bg-light text-dark me-1 mb-1">${kode.kode}</span>`
                            ).join('') : ''}
                            ${group.kodes && group.kodes.length > 5 ? `<span class="badge bg-secondary">+${group.kodes.length - 5} lagi</span>` : ''}
                        </div>
                        <div class="mt-3 d-flex flex-wrap gap-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="viewGroupDetails('${key}')">
                                <i class="fas fa-eye me-1"></i> Lihat
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="downloadGroupKodes('${key}')">
                                <i class="fas fa-download me-1"></i> Download
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteKodeGroup('${key}', '${group.groupName.replace(/'/g, "\\'")}')">
                                <i class="fas fa-trash me-1"></i> Hapus
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(groupElement);
            });
        } else {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i> Belum ada grup kode yang dibuat
                    </div>
                </div>
            `;
        }
    });
}
// Fungsi untuk menghapus grup kode
function deleteKodeGroup(groupId, groupName) {
    Swal.fire({
        title: 'Hapus Grup Kode?',
        html: `
            <div class="text-center">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h5>Apakah Anda yakin ingin menghapus grup kode?</h5>
                <p class="text-danger"><strong>${groupName}</strong></p>
                <p class="text-muted">Semua kode dalam grup ini akan dihapus permanen!</p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        backdrop: 'rgba(0,0,0,0.4)',
        width: 500
    }).then((result) => {
        if (result.isConfirmed) {
            // Show loading
            Swal.fire({
                title: 'Menghapus Grup Kode...',
                text: 'Sedang menghapus kode dari database',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Pertama, ambil data grup untuk mendapatkan daftar kode
            database.ref('kodeGroups/' + groupId).once('value').then((snapshot) => {
                const group = snapshot.val();
                if (!group) {
                    throw new Error('Grup tidak ditemukan');
                }

                const deletePromises = [];

                // Hapus semua kode individual dari kodeUnik
                if (group.kodes && group.kodes.length > 0) {
                    group.kodes.forEach(kode => {
                        deletePromises.push(
                            database.ref('kodeUnik/' + kode.kode).remove()
                        );
                    });
                }

                // Hapus grup itu sendiri
                deletePromises.push(
                    database.ref('kodeGroups/' + groupId).remove()
                );

                // Eksekusi semua penghapusan
                return Promise.all(deletePromises);
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus!',
                    html: `
                        <div class="text-center">
                            <i class="fas fa-trash fa-3x text-success mb-3"></i>
                            <h5>Grup kode berhasil dihapus</h5>
                            <p class="text-muted">Semua kode dalam grup <strong>${groupName}</strong> telah dihapus</p>
                        </div>
                    `,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                });
                
                // Refresh list grup kode
                loadKodeGroups();
            })
            .catch((error) => {
                console.error('Error deleting group:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Menghapus!',
                    html: `
                        <div class="text-start">
                            <p>Gagal menghapus grup kode</p>
                            <details class="mt-3">
                                <summary>Detail Error</summary>
                                <code class="text-danger">${error.message || error}</code>
                            </details>
                        </div>
                    `,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
            });
        }
    });
}

// Fungsi untuk menghapus kode individual
function deleteSingleKode(kode, groupId) {
    Swal.fire({
        title: 'Hapus Kode?',
        html: `
            <div class="text-center">
                <i class="fas fa-key fa-3x text-warning mb-3"></i>
                <h5>Apakah Anda yakin ingin menghapus kode?</h5>
                <p class="text-danger"><strong>${kode}</strong></p>
                <p class="text-muted">Kode ini tidak bisa digunakan untuk voting</p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        backdrop: 'rgba(0,0,0,0.4)'
    }).then((result) => {
        if (result.isConfirmed) {
            // Show loading
            Swal.fire({
                title: 'Menghapus Kode...',
                text: 'Sedang menghapus kode dari database',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Hapus kode individual
            database.ref('kodeUnik/' + kode).remove()
                .then(() => {
                    // Jika ada groupId, update grup dengan menghapus kode dari array
                    if (groupId) {
                        return database.ref('kodeGroups/' + groupId + '/kodes').transaction((kodes) => {
                            if (kodes) {
                                return kodes.filter(k => k.kode !== kode);
                            }
                            return kodes;
                        });
                    }
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Terhapus!',
                        text: `Kode ${kode} berhasil dihapus`,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3085d6'
                    });
                    
                    // Refresh data
                    if (groupId) {
                        viewGroupDetails(groupId);
                    } else {
                        loadKodeGroups();
                    }
                })
                .catch((error) => {
                    console.error('Error deleting kode:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal Menghapus!',
                        text: 'Gagal menghapus kode: ' + error.message,
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#d33'
                    });
                });
        }
    });
}
function viewGroupDetails(groupId) {
    database.ref('kodeGroups/' + groupId).once('value').then((snapshot) => {
        const group = snapshot.val();
        if (group) {
            const usedCount = group.kodes ? group.kodes.filter(k => k.status === 'used').length : 0;
            const activeCount = group.kodes ? group.kodes.length - usedCount : 0;
            
            Swal.fire({
                title: `Detail Grup: ${group.groupName}`,
                html: `
                    <div class="text-start">
                        <div class="row mb-3">
                            <div class="col-6">
                                <div class="card bg-primary text-white">
                                    <div class="card-body text-center p-3">
                                        <h6>Total Kode</h6>
                                        <h4>${group.kodes ? group.kodes.length : 0}</h4>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="card bg-success text-white">
                                    <div class="card-body text-center p-3">
                                        <h6>Sudah Digunakan</h6>
                                        <h4>${usedCount}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p><strong>Prefix:</strong> ${group.prefix}</p>
                        <p><strong>Dibuat:</strong> ${new Date(group.createdAt).toLocaleString('id-ID')}</p>
                        <p><strong>Kode Aktif:</strong> ${activeCount}</p>
                        
                        <div class="d-flex gap-2 mb-3">
                            <button class="btn btn-sm btn-outline-danger" onclick="Swal.close(); deleteKodeGroup('${groupId}', '${group.groupName.replace(/'/g, "\\'")}')">
                                <i class="fas fa-trash me-1"></i> Hapus Grup
                            </button>
                            <button class="btn btn-sm btn-outline-success" onclick="Swal.close(); downloadGroupKodes('${groupId}')">
                                <i class="fas fa-download me-1"></i> Download
                            </button>
                        </div>
                        
                        <div class="mt-3">
                            <h6>Daftar Kode:</h6>
                            <div style="max-height: 300px; overflow-y: auto;">
                                ${group.kodes ? group.kodes.map(kode => `
                                    <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                                        <div>
                                            <span class="fw-bold">${kode.kode}</span>
                                            ${kode.status === 'used' ? 
                                                '<small class="text-muted ms-2">(Sudah digunakan)</small>' : 
                                                '<small class="text-success ms-2">(Aktif)</small>'
                                            }
                                        </div>
                                        <div>
                                            <button class="btn btn-sm btn-outline-danger" onclick="deleteSingleKode('${kode.kode}', '${groupId}')">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('') : '<p class="text-muted">Tidak ada kode</p>'}
                            </div>
                        </div>
                    </div>
                `,
                width: 600,
                showConfirmButton: false,
                showCloseButton: true
            });
        }
    });
}

function downloadGroupKodes(groupId) {
    database.ref('kodeGroups/' + groupId).once('value').then((snapshot) => {
        const group = snapshot.val();
        if (group) {
            const worksheet = XLSX.utils.json_to_sheet(group.kodes.map(k => ({ 
                'Kode': k.kode, 
                'Status': k.status === 'used' ? 'Digunakan' : 'Aktif',
                'Prefix': k.prefix,
                'Grup': k.groupName
            })));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Kode Voting");
            XLSX.writeFile(workbook, `kode_grup_${group.groupName}_${Date.now()}.xlsx`);
            
            Swal.fire({
                icon: 'success',
                title: 'Terdownload!',
                text: `File Excel untuk grup ${group.groupName} berhasil didownload`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
        }
    });
}

// Download hasil voting
function downloadResults() {
    database.ref('candidates').once('value').then((candidatesSnapshot) => {
        const candidates = candidatesSnapshot.val();
        database.ref('votes').once('value').then((votesSnapshot) => {
            const votes = votesSnapshot.val();
            database.ref('kodeUnik').once('value').then((kodeSnapshot) => {
                const totalKode = kodeSnapshot.numChildren();
                let usedKodes = 0;
                
                if (kodeSnapshot.exists()) {
                    kodeSnapshot.forEach(childSnapshot => {
                        if (childSnapshot.val().status === 'used') {
                            usedKodes++;
                        }
                    });
                }

                let resultsData = [];
                let totalVotes = 0;

                if (candidates && votes) {
                    Object.keys(candidates).forEach(key => {
                        const candidate = candidates[key];
                        const voteCount = votes[key] || 0;
                        totalVotes += voteCount;
                        const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100).toFixed(2) : 0;
                        
                        resultsData.push({
                            'Nama Kandidat': candidate.nama,
                            'Visi': candidate.visi,
                            'Misi': candidate.misi,
                            'Jumlah Suara': voteCount,
                            'Persentase': percentage + '%',
                            'Peringkat': '-'
                        });
                    });

                    // Sort by votes and add ranking
                    resultsData.sort((a, b) => b['Jumlah Suara'] - a['Jumlah Suara']);
                    resultsData.forEach((item, index) => {
                        item.Peringkat = index + 1;
                    });
                }

                // Add summary data
                const summaryData = [
                    {},
                    { 'Nama Kandidat': 'STATISTIK VOTING', 'Jumlah Suara': '' },
                    { 'Nama Kandidat': 'Total Pemilih', 'Jumlah Suara': totalKode },
                    { 'Nama Kandidat': 'Sudah Memilih', 'Jumlah Suara': usedKodes },
                    { 'Nama Kandidat': 'Belum Memilih', 'Jumlah Suara': totalKode - usedKodes },
                    { 'Nama Kandidat': 'Total Suara', 'Jumlah Suara': totalVotes },
                    { 'Nama Kandidat': 'Tanggal Export', 'Jumlah Suara': new Date().toLocaleString('id-ID') }
                ];

                const worksheet1 = XLSX.utils.json_to_sheet(resultsData);
                const worksheet2 = XLSX.utils.json_to_sheet(summaryData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet1, "Hasil Voting");
                XLSX.utils.book_append_sheet(workbook, worksheet2, "Statistik");
                XLSX.writeFile(workbook, `hasil_voting_osis_${Date.now()}.xlsx`);

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'File Excel hasil voting berhasil didownload',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                });
            });
        });
    });
}

// Load results real-time
function loadResults() {
    // Load voting statistics
    database.ref('kodeUnik').on('value', (kodeSnapshot) => {
        const totalKode = kodeSnapshot.numChildren();
        let usedKodes = 0;
        
        if (kodeSnapshot.exists()) {
            kodeSnapshot.forEach(childSnapshot => {
                if (childSnapshot.val().status === 'used') {
                    usedKodes++;
                }
            });
        }
        
        document.getElementById('total-pemilih').textContent = totalKode.toLocaleString();
        document.getElementById('sudah-memilih').textContent = usedKodes.toLocaleString();
        document.getElementById('belum-memilih').textContent = (totalKode - usedKodes).toLocaleString();
    });

    // Load candidate count
    database.ref('candidates').on('value', (candidateSnapshot) => {
        document.getElementById('total-kandidat').textContent = candidateSnapshot.numChildren().toLocaleString();
    });

    // Load voting results
    database.ref('votes').on('value', (votesSnapshot) => {
        const votes = votesSnapshot.val();
        database.ref('candidates').once('value').then((candidatesSnapshot) => {
            const candidates = candidatesSnapshot.val();
            const container = document.getElementById('results-container');
            
            if (candidates && votes) {
                let totalVotes = 0;
                Object.values(votes).forEach(voteCount => {
                    totalVotes += voteCount;
                });

                let resultsHTML = '<div class="results-list">';
                
                // Sort candidates by votes
                const sortedCandidates = Object.keys(candidates).map(key => {
                    return {
                        id: key,
                        ...candidates[key],
                        votes: votes[key] || 0
                    };
                }).sort((a, b) => b.votes - a.votes);

                sortedCandidates.forEach((candidate, index) => {
                    const percentage = totalVotes > 0 ? (candidate.votes / totalVotes * 100).toFixed(1) : 0;
                    const rankClass = index === 0 ? 'border-warning' : index === 1 ? 'border-info' : index === 2 ? 'border-success' : '';
                    
                    resultsHTML += `
                        <div class="card mb-3 ${rankClass}" style="border-width: 3px;">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-1 text-center">
                                        <div class="rank-circle ${index < 3 ? 'rank-' + (index + 1) : ''}">
                                            <h4 class="mb-0">${index + 1}</h4>
                                        </div>
                                    </div>
                                    <div class="col-md-2 text-center">
                                        <img src="${candidate.foto || 'https://via.placeholder.com/80?text=Foto'}" 
                                             alt="${candidate.nama}" 
                                             class="rounded-circle" 
                                             style="width: 80px; height: 80px; object-fit: cover; border: 3px solid #dee2e6;">
                                    </div>
                                    <div class="col-md-5">
                                        <h5 class="card-title text-primary">${candidate.nama}</h5>
                                        <p class="card-text mb-1"><small class="text-muted">${candidate.visi}</small></p>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="text-end">
                                            <h4 class="text-success mb-2">${candidate.votes} Suara</h4>
                                            <div class="result-bar">
                                                <div class="result-fill" style="width: ${percentage}%"></div>
                                            </div>
                                            <p class="mb-0"><small>${percentage}% dari total suara</small></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                resultsHTML += '</div>';
                container.innerHTML = resultsHTML;
            } else {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-chart-bar fa-4x text-muted mb-3"></i>
                        <h4 class="text-muted">Belum ada hasil voting</h4>
                        <p class="text-muted">Hasil voting akan muncul di sini setelah pemilihan dimulai</p>
                    </div>
                `;
            }
        });
    });
}

// Add rank circle styles
const style = document.createElement('style');
style.textContent = `
    .rank-circle {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        border: 3px solid #dee2e6;
        font-weight: bold;
    }
    .rank-1 {
        background: linear-gradient(135deg, #FFD700, #FFA500);
        border-color: #FFA500;
        color: white;
    }
    .rank-2 {
        background: linear-gradient(135deg, #C0C0C0, #A9A9A9);
        border-color: #A9A9A9;
        color: white;
    }
    .rank-3 {
        background: linear-gradient(135deg, #CD7F32, #8B4513);
        border-color: #8B4513;
        color: white;
    }
`;
document.head.appendChild(style);

// Auto reload results every 3 seconds
setInterval(() => {
    if (document.getElementById('hasil-tab').style.display !== 'none') {
        loadResults();
    }
}, 3000);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Voting system initialized');
    loadAdminCandidates();
    loadResults();
    
    // Auto start timer if in voting section
    if (document.getElementById('voting-section').classList.contains('active-section')) {
        startVotingTimer();
    }
});
// Test database connection
function testDatabaseConnection() {
    Swal.fire({
        title: 'Testing Database Connection...',
        text: 'Memeriksa koneksi ke Firebase',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const testRef = database.ref('connectionTest');
    const testData = {
        timestamp: new Date().toISOString(),
        test: 'success'
    };

    testRef.set(testData)
        .then(() => {
            return testRef.once('value');
        })
        .then((snapshot) => {
            Swal.close();
            if (snapshot.exists()) {
                Swal.fire({
                    icon: 'success',
                    title: 'Database Connected!',
                    text: 'Koneksi ke Firebase berhasil',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Database Error',
                    text: 'Gagal membaca data dari Firebase',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
            }
        })
        .catch((error) => {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Connection Failed!',
                html: `
                    <div class="text-start">
                        <p>Gagal terhubung ke Firebase Database</p>
                        <details class="mt-3">
                            <summary>Detail Error</summary>
                            <code class="text-danger">${error.message || error}</code>
                        </details>
                        <p class="mt-3"><strong>Solusi:</strong></p>
                        <ol class="text-start">
                            <li>Buka Firebase Console</li>
                            <li>Pilih project database62-e9ae4</li>
                            <li>Pergi ke Realtime Database → Rules</li>
                            <li>Ganti rules dengan:</li>
                        </ol>
                        <pre class="text-start bg-light p-2 rounded">
{
  "rules": {
    ".read": true,
    ".write": true
  }
}</pre>
                    </div>
                `,
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33',
                width: 700
            });
        });
}

// Tambahkan tombol test connection di admin panel (opsional)
function addTestConnectionButton() {
    const adminNav = document.querySelector('.admin-nav');
    if (adminNav) {
        const testBtn = document.createElement('button');
        testBtn.className = 'btn btn-sm btn-outline-warning ms-2';
        testBtn.innerHTML = '<i class="fas fa-bug me-1"></i> Test DB';
        testBtn.onclick = testDatabaseConnection;
        adminNav.appendChild(testBtn);
    }
}
// Fungsi untuk fullscreen hasil voting
function showFullscreenResults() {
    // Buat elemen fullscreen
    const fullscreenHTML = `
        <div id="fullscreen-results" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            overflow-y: auto;
            padding: 20px;
            color: white;
        ">
            <div class="container-fluid">
                <!-- Header -->
                <div class="row mb-4">
                    <div class="col-12 text-center">
                        <button class="btn btn-danger btn-sm mb-3" onclick="closeFullscreenResults()" style="
                            position: absolute;
                            top: 15px;
                            right: 15px;
                            z-index: 10000;
                        ">
                            <i class="fas fa-times me-1"></i> Tutup
                        </button>
                        <h1 class="display-4 fw-bold text-white">AT-THOHARIYAH</h1>
                        <h3 class="text-warning">HASIL VOTING REAL-TIME</h3>
                        <div class="live-badge">
                            <i class="fas fa-circle fa-xs me-1 blink"></i> 
                            LIVE RESULTS
                        </div>
                        <p class="text-light opacity-75">Update Otomatis Setiap 3 Detik</p>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="row mb-4" id="fullscreen-stats">
                    <!-- Stats akan diisi oleh JavaScript -->
                </div>

                <!-- Results -->
                <div class="row">
                    <div class="col-12">
                        <div id="fullscreen-results-container">
                            <!-- Hasil voting akan diisi oleh JavaScript -->
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="row mt-5">
                    <div class="col-12 text-center">
                        <p class="text-light opacity-50">
                            <i class="fas fa-clock me-1"></i>
                            Terakhir update: <span id="last-update">${new Date().toLocaleTimeString('id-ID')}</span>
                        </p>
                        <p class="text-light opacity-75">
                            <i class="fas fa-code me-1"></i>
                            Developed by <strong class="text-warning">IlhamDev</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Tambahkan ke body
    document.body.insertAdjacentHTML('beforeend', fullscreenHTML);

    // Load data pertama kali
    loadFullscreenResults();

    // Auto refresh setiap 3 detik
    if (window.fullscreenResultsInterval) {
        clearInterval(window.fullscreenResultsInterval);
    }
    window.fullscreenResultsInterval = setInterval(loadFullscreenResults, 3000);

    // Auto enter fullscreen
    enterFullscreen();
}

// Fungsi untuk menutup fullscreen results
function closeFullscreenResults() {
    const fullscreenEl = document.getElementById('fullscreen-results');
    if (fullscreenEl) {
        fullscreenEl.remove();
    }
    
    if (window.fullscreenResultsInterval) {
        clearInterval(window.fullscreenResultsInterval);
    }
    
    exitFullscreen();
}

// Fungsi untuk masuk fullscreen
function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

// Fungsi untuk keluar fullscreen
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Load data untuk fullscreen results dengan diagram batang horizontal
function loadFullscreenResults() {
    // Update waktu terakhir update
    document.getElementById('last-update').textContent = new Date().toLocaleTimeString('id-ID');

    // Load stats
    database.ref('kodeUnik').once('value').then((kodeSnapshot) => {
        const totalKode = kodeSnapshot.numChildren();
        let usedKodes = 0;
        
        if (kodeSnapshot.exists()) {
            kodeSnapshot.forEach(childSnapshot => {
                if (childSnapshot.val().status === 'used') {
                    usedKodes++;
                }
            });
        }

        const statsHTML = `
            <div class="col-md-3 mb-3">
                <div class="card bg-primary bg-opacity-20 text-white border-light">
                    <div class="card-body text-center py-4">
                        <i class="fas fa-users fa-2x mb-2"></i>
                        <h3 class="fw-bold">${totalKode}</h3>
                        <p class="mb-0">Total Pemilih</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-success bg-opacity-20 text-white border-light">
                    <div class="card-body text-center py-4">
                        <i class="fas fa-check-circle fa-2x mb-2"></i>
                        <h3 class="fw-bold">${usedKodes}</h3>
                        <p class="mb-0">Sudah Memilih</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-warning bg-opacity-20 text-white border-light">
                    <div class="card-body text-center py-4">
                        <i class="fas fa-clock fa-2x mb-2"></i>
                        <h3 class="fw-bold">${totalKode - usedKodes}</h3>
                        <p class="mb-0">Belum Memilih</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card bg-info bg-opacity-20 text-white border-light">
                    <div class="card-body text-center py-4">
                        <i class="fas fa-user-friends fa-2x mb-2"></i>
                        <h3 class="fw-bold" id="fullscreen-candidate-count">0</h3>
                        <p class="mb-0">Total Kandidat</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('fullscreen-stats').innerHTML = statsHTML;
    });

    // Load results dengan diagram batang horizontal
    database.ref('votes').once('value').then((votesSnapshot) => {
        const votes = votesSnapshot.val();
        database.ref('candidates').once('value').then((candidatesSnapshot) => {
            const candidates = candidatesSnapshot.val();
            const container = document.getElementById('fullscreen-results-container');
            
            // Update candidate count
            document.getElementById('fullscreen-candidate-count').textContent = candidatesSnapshot.numChildren();

            if (candidates && votes) {
                let totalVotes = 0;
                Object.values(votes).forEach(voteCount => {
                    totalVotes += voteCount;
                });

                // Sort candidates by votes
                const sortedCandidates = Object.keys(candidates).map(key => {
                    const percentage = totalVotes > 0 ? (votes[key] || 0) / totalVotes * 100 : 0;
                    return {
                        id: key,
                        ...candidates[key],
                        votes: votes[key] || 0,
                        percentage: percentage
                    };
                }).sort((a, b) => b.votes - a.votes);

                let resultsHTML = `
                    <div class="row">
                        <div class="col-12">
                            <div class="horizontal-chart-container">
                                <div class="horizontal-bars">
                `;
                
                sortedCandidates.forEach((candidate, index) => {
                    const percentage = candidate.percentage.toFixed(1);
                    const barWidth = Math.max(percentage, 5); // Minimum width 5%
                    
                    // Warna berdasarkan ranking
                    let barColor = 'bar-secondary';
                    let rankClass = '';
                    let rankIcon = '';
                    
                    if (index === 0) {
                        barColor = 'bar-gold';
                        rankClass = 'first-place';
                        rankIcon = '<i class="fas fa-crown me-2"></i>';
                    } else if (index === 1) {
                        barColor = 'bar-silver';
                        rankClass = 'second-place';
                        rankIcon = '<i class="fas fa-medal me-2"></i>';
                    } else if (index === 2) {
                        barColor = 'bar-bronze';
                        rankClass = 'third-place';
                        rankIcon = '<i class="fas fa-award me-2"></i>';
                    }

                    resultsHTML += `
                        <div class="horizontal-bar-item ${rankClass}">
                            <div class="bar-info-wrapper">
                                <div class="candidate-rank">
                                    <span class="rank-number">${index + 1}</span>
                                </div>
                                <div class="candidate-info">
                                    <div class="candidate-name-wrapper">
                                        <h5 class="candidate-name">
                                            ${rankIcon}${candidate.nama}
                                        </h5>
                                    </div>
                                    <div class="votes-info">
                                        <span class="votes-count">${candidate.votes} suara</span>
                                        <span class="percentage">${percentage}%</span>
                                    </div>
                                </div>
                            </div>
                            <div class="bar-track">
                                <div class="horizontal-bar ${barColor}" style="width: ${barWidth}%">
                                    <div class="bar-progress"></div>
                                    <div class="bar-value">${percentage}%</div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                resultsHTML += `
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                container.innerHTML = resultsHTML;
            } else {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-chart-bar fa-5x text-light opacity-50 mb-3"></i>
                        <h3 class="text-light opacity-75">Belum ada hasil voting</h3>
                        <p class="text-light opacity-50">Hasil voting akan muncul di sini setelah pemilihan dimulai</p>
                    </div>
                `;
            }
        });
    });
}
// Server Calibration Functions
let systemLogs = [];

function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
        timestamp: timestamp,
        message: message,
        type: type
    };
    
    systemLogs.unshift(logEntry); // Add to beginning
    if (systemLogs.length > 50) systemLogs.pop(); // Keep only last 50 logs
    
    updateLogsDisplay();
}

function updateLogsDisplay() {
    const logsContainer = document.getElementById('system-logs');
    if (logsContainer) {
        logsContainer.innerHTML = systemLogs.map(log => `
            <div class="log-entry text-${log.type}">
                [${log.timestamp}] ${log.message}
            </div>
        `).join('');
    }
}

function clearLogs() {
    systemLogs = [];
    updateLogsDisplay();
    addLog('Logs cleared', 'warning');
}

// Fungsi calibrate server utama
function calibrateServer() {
    const calibrateBtn = document.getElementById('calibrate-btn');
    const originalText = calibrateBtn.innerHTML;
    
    // Disable button dan show loading
    calibrateBtn.disabled = true;
    calibrateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Calibrating...';
    
    addLog('Starting server calibration...', 'info');
    
    // Reset status
    updateConnectionStatus('checking', 'Checking connection...');
    updateHealthIndicator('db', 'unknown', 0);
    updateHealthIndicator('auth', 'unknown', 0);
    updateHealthIndicator('rw', 'unknown', 0);
    
    const startTime = Date.now();
    
    // Test 1: Database Connection
    testDatabaseConnectionDetailed()
        .then((dbResult) => {
            updateHealthIndicator('db', dbResult.status, dbResult.score);
            addLog(`Database connection: ${dbResult.message}`, dbResult.status);
            
            // Test 2: Authentication
            return testAuthentication();
        })
        .then((authResult) => {
            updateHealthIndicator('auth', authResult.status, authResult.score);
            addLog(`Authentication: ${authResult.message}`, authResult.status);
            
            // Test 3: Read/Write Operations
            return testReadWriteOperations();
        })
        .then((rwResult) => {
            updateHealthIndicator('rw', rwResult.status, rwResult.score);
            addLog(`Read/Write operations: ${rwResult.message}`, rwResult.status);
            
            // Calculate overall health
            const totalScore = (dbResult.score + authResult.score + rwResult.score) / 3;
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            // Update UI
            document.getElementById('info-lastcheck').textContent = new Date().toLocaleString('id-ID');
            document.getElementById('info-responsetime').textContent = `${responseTime}ms`;
            
            updateOverallHealth(totalScore);
            
            if (totalScore >= 80) {
                updateConnectionStatus('online', 'Server connected and healthy');
                addLog(`Server calibration completed successfully (${totalScore.toFixed(1)}%)`, 'success');
                showCalibrationSuccess();
            } else if (totalScore >= 50) {
                updateConnectionStatus('warning', 'Server connected with warnings');
                addLog(`Server calibration completed with warnings (${totalScore.toFixed(1)}%)`, 'warning');
                showCalibrationWarning();
            } else {
                updateConnectionStatus('offline', 'Server connection issues detected');
                addLog(`Server calibration failed (${totalScore.toFixed(1)}%)`, 'danger');
                showCalibrationError();
            }
        })
        .catch((error) => {
            addLog(`Calibration failed: ${error.message}`, 'danger');
            updateConnectionStatus('error', 'Calibration failed');
            updateOverallHealth(0);
            showCalibrationError();
        })
        .finally(() => {
            // Re-enable button
            calibrateBtn.disabled = false;
            calibrateBtn.innerHTML = originalText;
        });
}

// Detailed database connection test
function testDatabaseConnectionDetailed() {
    return new Promise((resolve) => {
        const testStart = Date.now();
        
        addLog('Testing database connection...', 'info');
        
        const testRef = database.ref('.info/connected');
        const timeout = setTimeout(() => {
            resolve({
                status: 'offline',
                score: 0,
                message: 'Connection timeout'
            });
        }, 10000);

        testRef.once('value')
            .then((snapshot) => {
                clearTimeout(timeout);
                const responseTime = Date.now() - testStart;
                
                if (snapshot.exists() && snapshot.val() === true) {
                    resolve({
                        status: 'online',
                        score: 100,
                        message: `Connected (${responseTime}ms)`
                    });
                } else {
                    resolve({
                        status: 'offline',
                        score: 0,
                        message: 'Not connected'
                    });
                }
            })
            .catch((error) => {
                clearTimeout(timeout);
                resolve({
                    status: 'error',
                    score: 0,
                    message: `Error: ${error.message}`
                });
            });
    });
}

// Test authentication
function testAuthentication() {
    return new Promise((resolve) => {
        addLog('Testing authentication...', 'info');
        
        // Check if user is authenticated
        const user = firebase.auth().currentUser;
        
        if (user) {
            resolve({
                status: 'online',
                score: 100,
                message: 'Authenticated (Anonymous)'
            });
        } else {
            // Try to authenticate
            firebase.auth().signInAnonymously()
                .then(() => {
                    resolve({
                        status: 'online',
                        score: 100,
                        message: 'Authenticated (Anonymous)'
                    });
                })
                .catch((error) => {
                    resolve({
                        status: 'warning',
                        score: 50,
                        message: `Auth failed: ${error.message}`
                    });
                });
        }
    });
}

// Test read/write operations
function testReadWriteOperations() {
    return new Promise((resolve) => {
        addLog('Testing read/write operations...', 'info');
        
        const testKey = `calibration_test_${Date.now()}`;
        const testData = {
            timestamp: new Date().toISOString(),
            test: 'read_write_operation'
        };

        // Test write
        database.ref(testKey).set(testData)
            .then(() => {
                // Test read
                return database.ref(testKey).once('value');
            })
            .then((snapshot) => {
                if (snapshot.exists() && snapshot.val().test === 'read_write_operation') {
                    // Clean up
                    return database.ref(testKey).remove();
                } else {
                    throw new Error('Data mismatch');
                }
            })
            .then(() => {
                resolve({
                    status: 'online',
                    score: 100,
                    message: 'Read/Write operations successful'
                });
            })
            .catch((error) => {
                resolve({
                    status: 'warning',
                    score: 30,
                    message: `Read/Write failed: ${error.message}`
                });
            });
    });
}

// Update connection status UI
function updateConnectionStatus(status, message) {
    const statusElement = document.getElementById('connection-status');
    if (!statusElement) return;

    const statusConfig = {
        online: { class: 'status-online', icon: 'fa-check-circle', text: 'Connected' },
        offline: { class: 'status-offline', icon: 'fa-times-circle', text: 'Disconnected' },
        warning: { class: 'status-warning', icon: 'fa-exclamation-triangle', text: 'Warning' },
        error: { class: 'status-error', icon: 'fa-exclamation-circle', text: 'Error' },
        checking: { class: 'status-checking', icon: 'fa-sync-alt fa-spin', text: 'Checking...' }
    };

    const config = statusConfig[status] || statusConfig.offline;
    
    statusElement.className = `status-badge ${config.class}`;
    statusElement.innerHTML = `<i class="fas ${config.icon} me-1"></i> ${message}`;
}

// Update health indicator
function updateHealthIndicator(type, status, score) {
    const indicator = document.getElementById(`health-${type}`);
    const progress = document.getElementById(`health-${type}-progress`);
    
    if (!indicator || !progress) return;
    
    const statusConfig = {
        online: { class: 'health-online', icon: 'fa-check-circle', color: 'bg-success' },
        offline: { class: 'health-offline', icon: 'fa-times-circle', color: 'bg-danger' },
        warning: { class: 'health-warning', icon: 'fa-exclamation-triangle', color: 'bg-warning' },
        error: { class: 'health-error', icon: 'fa-exclamation-circle', color: 'bg-danger' },
        unknown: { class: 'health-unknown', icon: 'fa-question-circle', color: 'bg-warning' }
    };
    
    const config = statusConfig[status] || statusConfig.unknown;
    
    indicator.className = `health-indicator ${config.class}`;
    indicator.innerHTML = `<i class="fas ${config.icon}"></i>`;
    
    progress.className = `progress-bar ${config.color}`;
    progress.style.width = `${score}%`;
}

// Update overall health
function updateOverallHealth(score) {
    const healthScore = document.getElementById('health-score');
    const healthStatus = document.getElementById('health-status');
    const summary = document.querySelector('.health-summary');
    
    if (!healthScore || !healthStatus || !summary) return;
    
    healthScore.textContent = `${Math.round(score)}%`;
    
    if (score >= 80) {
        healthStatus.textContent = 'System Healthy';
        summary.className = 'health-summary mt-4 p-3 rounded text-center bg-success bg-opacity-20';
    } else if (score >= 50) {
        healthStatus.textContent = 'System Needs Attention';
        summary.className = 'health-summary mt-4 p-3 rounded text-center bg-warning bg-opacity-20';
    } else {
        healthStatus.textContent = 'System Unhealthy';
        summary.className = 'health-summary mt-4 p-3 rounded text-center bg-danger bg-opacity-20';
    }
}

// SweetAlert for calibration results
function showCalibrationSuccess() {
    Swal.fire({
        icon: 'success',
        title: 'Calibration Successful!',
        html: `
            <div class="text-center">
                <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
                <h4>Server Connected and Healthy</h4>
                <p class="text-muted">All systems are functioning properly</p>
            </div>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
    });
}

function showCalibrationWarning() {
    Swal.fire({
        icon: 'warning',
        title: 'Calibration Completed with Warnings',
        html: `
            <div class="text-center">
                <i class="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
                <h4>Server Connected with Issues</h4>
                <p class="text-muted">Some features may not work correctly</p>
                <p class="text-muted small">Check system logs for details</p>
            </div>
        `,
        confirmButtonText: 'View Logs',
        confirmButtonColor: '#f39c12'
    });
}

function showCalibrationError() {
    Swal.fire({
        icon: 'error',
        title: 'Calibration Failed!',
        html: `
            <div class="text-start">
                <i class="fas fa-times-circle fa-4x text-danger mb-3"></i>
                <h4>Server Connection Issues</h4>
                <p class="text-muted">System cannot connect to database</p>
                <div class="alert alert-danger mt-3">
                    <strong>Possible Solutions:</strong>
                    <ul class="mt-2">
                        <li>Check internet connection</li>
                        <li>Verify Firebase configuration</li>
                        <li>Check database rules in Firebase Console</li>
                        <li>Contact administrator</li>
                    </ul>
                </div>
            </div>
        `,
        confirmButtonText: 'Retry',
        confirmButtonColor: '#d33',
        showCancelButton: true,
        cancelButtonText: 'View Logs'
    }).then((result) => {
        if (result.isConfirmed) {
            calibrateServer();
        }
    });
}

// Auto-calibrate when settings tab is opened
function showAdminTab(tabId) {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
    
    // Update active nav link
    document.querySelectorAll('.admin-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load data for specific tabs
    if (tabId === 'riwayat-kode-tab') {
        loadKodeGroups();
    } else if (tabId === 'hasil-tab') {
        loadResults();
    } else if (tabId === 'settings-tab') {
        // Auto-calibrate when settings tab is opened
        setTimeout(() => {
            calibrateServer();
        }, 1000);
    }
}
// Fungsi untuk reset sistem lisensi
function resetLicenseSystem() {
    Swal.fire({
        title: 'Reset Sistem Lisensi?',
        html: `
            <div class="text-center">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h5>Reset semua data lisensi?</h5>
                <p class="text-muted">Semua data lisensi akan dihapus dan sistem akan dikunci</p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Reset!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    }).then((result) => {
        if (result.isConfirmed) {
            currentLicense = null;
            licenseValid = false;
            localStorage.removeItem('voting_system_license');
            updateLicenseUI();
            disableApplicationFeatures();
            
            showLicenseAlert('success', 'Sistem lisensi berhasil direset');
        }
    });
}

// Fungsi untuk mengubah konfigurasi lisensi (developer function)
function updateLicenseConfig(newConfig) {
    if (newConfig.PRODUCT_CODE) {
        LICENSE_CONFIG.PRODUCT_CODE = newConfig.PRODUCT_CODE;
        document.getElementById('product-code').value = newConfig.PRODUCT_CODE;
    }
    
    if (newConfig.DEFAULT_LICENSE) {
        LICENSE_CONFIG.DEFAULT_LICENSE = newConfig.DEFAULT_LICENSE;
    }
    
    if (newConfig.VALIDITY_PERIOD) {
        LICENSE_CONFIG.VALIDITY_PERIOD = newConfig.VALIDITY_PERIOD;
    }
    
    console.log('✅ Konfigurasi lisensi diperbarui:', LICENSE_CONFIG);
}

// Contoh penggunaan update konfigurasi:
function setCustomLicenseConfig() {
    const newConfig = {
        PRODUCT_CODE: "VOTING-SMK-DEMO", // Ganti kode produk
        DEFAULT_LICENSE: "SMKAT-54321-09876-ZYXWV-UTSRQ", // Ganti kode default
        VALIDITY_PERIOD: 180 // Ganti jadi 180 hari (6 bulan)
    };
    
    updateLicenseConfig(newConfig);
    showLicenseAlert('success', 'Konfigurasi lisensi diperbarui!');
}
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggle-license-visibility');
    const licenseInput = document.getElementById('license-key');
    
    if (toggleBtn && licenseInput) {
        toggleBtn.addEventListener('click', function() {
            const type = licenseInput.getAttribute('type') === 'password' ? 'text' : 'password';
            licenseInput.setAttribute('type', type);
            toggleBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Initialize license system
    initializeLicenseSystem();
    checkLicenseAndLockFeatures();
});