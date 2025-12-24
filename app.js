// ==================== DATA MANAGEMENT ====================

class StorageManager {
    constructor() {
        this.keys = {
            company: 'quotation_company',
            products: 'quotation_products',
            offers: 'quotation_offers',
            currentOffer: 'quotation_current_offer'
        };
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.keys.company)) {
            this.saveCompany({
                name: '',
                taxNo: '',
                taxOffice: '',
                address: '',
                phone: '',
                email: '',
                website: '',
                logo: ''
            });
        }
        if (!localStorage.getItem(this.keys.products)) {
            this.saveProducts([]);
        }
        if (!localStorage.getItem(this.keys.offers)) {
            this.saveOffers([]);
        }
    }

    // Company
    getCompany() {
        return JSON.parse(localStorage.getItem(this.keys.company));
    }

    saveCompany(data) {
        localStorage.setItem(this.keys.company, JSON.stringify(data));
    }

    // Products
    getProducts() {
        return JSON.parse(localStorage.getItem(this.keys.products)) || [];
    }

    saveProducts(products) {
        localStorage.setItem(this.keys.products, JSON.stringify(products));
    }

    addProduct(product) {
        const products = this.getProducts();
        product.id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        products.push(product);
        this.saveProducts(products);
        return product;
    }

    updateProduct(id, updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct };
            this.saveProducts(products);
            return products[index];
        }
        return null;
    }

    deleteProduct(id) {
        const products = this.getProducts().filter(p => p.id !== id);
        this.saveProducts(products);
    }

    // Offers
    getOffers() {
        return JSON.parse(localStorage.getItem(this.keys.offers)) || [];
    }

    saveOffers(offers) {
        localStorage.setItem(this.keys.offers, JSON.stringify(offers));
    }

    addOffer(offer) {
        const offers = this.getOffers();
        offer.id = 'offer_' + Date.now();
        offer.date = new Date().toISOString();
        offer.offerNo = 'TEK-' + new Date().getFullYear() + '-' + String(offers.length + 1).padStart(4, '0');
        offers.unshift(offer);
        this.saveOffers(offers);
        return offer;
    }

    updateOffer(id, updatedOffer) {
        const offers = this.getOffers();
        const index = offers.findIndex(o => o.id === id);
        if (index !== -1) {
            offers[index] = { ...offers[index], ...updatedOffer, updatedAt: new Date().toISOString() };
            this.saveOffers(offers);
            return offers[index];
        }
        return null;
    }

    deleteOffer(id) {
        const offers = this.getOffers().filter(o => o.id !== id);
        this.saveOffers(offers);
    }

    // Current Offer (Draft)
    getCurrentOffer() {
        return JSON.parse(localStorage.getItem(this.keys.currentOffer));
    }

    saveCurrentOffer(offer) {
        localStorage.setItem(this.keys.currentOffer, JSON.stringify(offer));
    }

    clearCurrentOffer() {
        localStorage.removeItem(this.keys.currentOffer);
    }

    // Export/Import
    exportAllData() {
        return {
            company: this.getCompany(),
            products: this.getProducts(),
            offers: this.getOffers(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    importAllData(data) {
        if (data.company) this.saveCompany(data.company);
        if (data.products) this.saveProducts(data.products);
        if (data.offers) this.saveOffers(data.offers);
    }
}

// ==================== APP INITIALIZATION ====================

const storage = new StorageManager();
let currentOfferItems = [];
let editingProductId = null;

// ==================== NAVIGATION ====================

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.dataset.section;
            
            // Update active states
            navButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetSection).classList.add('active');

            // Load section data
            if (targetSection === 'products') {
                renderProductsLibrary();
            } else if (targetSection === 'company') {
                loadCompanyForm();
            } else if (targetSection === 'history') {
                renderHistory();
            }
        });
    });
}

// ==================== COMPANY MANAGEMENT ====================

function loadCompanyForm() {
    const company = storage.getCompany();
    
    document.getElementById('companyName').value = company.name || '';
    document.getElementById('companyTaxNo').value = company.taxNo || '';
    document.getElementById('companyTaxOffice').value = company.taxOffice || '';
    document.getElementById('companyAddress').value = company.address || '';
    document.getElementById('companyPhone').value = company.phone || '';
    document.getElementById('companyEmail').value = company.email || '';
    document.getElementById('companyWebsite').value = company.website || '';

    if (company.logo) {
        document.getElementById('logoPreview').innerHTML = `<img src="${company.logo}" alt="Logo">`;
    }
}

function saveCompanyInfo() {
    const company = {
        name: document.getElementById('companyName').value,
        taxNo: document.getElementById('companyTaxNo').value,
        taxOffice: document.getElementById('companyTaxOffice').value,
        address: document.getElementById('companyAddress').value,
        phone: document.getElementById('companyPhone').value,
        email: document.getElementById('companyEmail').value,
        website: document.getElementById('companyWebsite').value,
        logo: storage.getCompany().logo || ''
    };

    if (!company.name) {
        alert('Firma adı zorunludur!');
        return;
    }

    storage.saveCompany(company);
    showNotification('Firma bilgileri kaydedildi!', 'success');
}

// Handle logo upload
document.getElementById('companyLogo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const logoData = event.target.result;
            const company = storage.getCompany();
            company.logo = logoData;
            storage.saveCompany(company);
            document.getElementById('logoPreview').innerHTML = `<img src="${logoData}" alt="Logo">`;
        };
        reader.readAsDataURL(file);
    }
});

// ==================== PRODUCT MANAGEMENT ====================

function loadProductsDropdown() {
    const products = storage.getProducts();
    const select = document.getElementById('productSelect');
    
    select.innerHTML = '<option value="">-- Yeni Ürün Gir --</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - ${formatCurrency(product.price)}`;
        select.appendChild(option);
    });
}

document.getElementById('productSelect').addEventListener('change', function() {
    const productId = this.value;
    if (productId) {
        const products = storage.getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('productName').value = product.name;
            document.getElementById('productUnit').value = product.unit;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productTax').value = product.tax;
        }
    } else {
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = 0;
    }
});

function renderProductsLibrary() {
    const products = storage.getProducts();
    const tbody = document.getElementById('productsLibraryBody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="5">Henüz ürün eklenmedi.</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.unit}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>%${product.tax}</td>
            <td class="table-actions">
                <button class="btn btn-secondary btn-icon" onclick="editProduct('${product.id}')">✏️</button>
                <button class="btn btn-danger btn-icon" onclick="deleteProductConfirm('${product.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    
    editingProductId = productId;
    
    if (productId) {
        title.textContent = 'Ürün Düzenle';
        const product = storage.getProducts().find(p => p.id === productId);
        if (product) {
            document.getElementById('modalProductName').value = product.name;
            document.getElementById('modalProductUnit').value = product.unit;
            document.getElementById('modalProductPrice').value = product.price;
            document.getElementById('modalProductTax').value = product.tax;
        }
    } else {
        title.textContent = 'Yeni Ürün Ekle';
        document.getElementById('modalProductName').value = '';
        document.getElementById('modalProductUnit').value = 'Adet';
        document.getElementById('modalProductPrice').value = 0;
        document.getElementById('modalProductTax').value = 20;
    }
    
    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    editingProductId = null;
}

function saveProductFromModal() {
    const name = document.getElementById('modalProductName').value.trim();
    const unit = document.getElementById('modalProductUnit').value;
    const price = parseFloat(document.getElementById('modalProductPrice').value);
    const tax = parseFloat(document.getElementById('modalProductTax').value);

    if (!name || price < 0) {
        alert('Lütfen gerekli alanları doldurun!');
        return;
    }

    const productData = { name, unit, price, tax };

    if (editingProductId) {
        storage.updateProduct(editingProductId, productData);
        showNotification('Ürün güncellendi!', 'success');
    } else {
        storage.addProduct(productData);
        showNotification('Ürün eklendi!', 'success');
    }

    closeProductModal();
    renderProductsLibrary();
    loadProductsDropdown();
}

function editProduct(id) {
    openProductModal(id);
}

function deleteProductConfirm(id) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        storage.deleteProduct(id);
        showNotification('Ürün silindi!', 'success');
        renderProductsLibrary();
        loadProductsDropdown();
    }
}

// Product search
document.getElementById('productSearch').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const products = storage.getProducts();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.getElementById('productsLibraryBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="5">Ürün bulunamadı.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.unit}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>%${product.tax}</td>
            <td class="table-actions">
                <button class="btn btn-secondary btn-icon" onclick="editProduct('${product.id}')">✏️</button>
                <button class="btn btn-danger btn-icon" onclick="deleteProductConfirm('${product.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
});

// ==================== OFFER MANAGEMENT ====================

function addProductToOffer() {
    const name = document.getElementById('productName').value.trim();
    const unit = document.getElementById('productUnit').value;
    const quantity = parseFloat(document.getElementById('productQuantity').value);
    const price = parseFloat(document.getElementById('productPrice').value);
    // İskonto kaldırıldı
    const tax = parseFloat(document.getElementById('productTax').value);

    if (!name || quantity <= 0 || price < 0) {
        alert('Lütfen gerekli alanları doldurun!');
        return;
    }

    const item = {
        id: 'item_' + Date.now(),
        name,
        unit,
        quantity,
        price,
        tax
    };

    // Save product to library if it's new
    const selectedProductId = document.getElementById('productSelect').value;
    if (!selectedProductId) {
        storage.addProduct({ name, unit, price, tax });
        loadProductsDropdown();
    }

    currentOfferItems.push(item);
    renderOfferItems();
    calculateTotals();

    // Reset form
    document.getElementById('productSelect').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productQuantity').value = 1;
    document.getElementById('productPrice').value = 0;
    // İskonto kaldırıldı
}

function renderOfferItems() {
    const tbody = document.getElementById('offerItemsBody');
    
    if (currentOfferItems.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="9">Henüz ürün eklenmedi. Yukarıdan ürün ekleyebilirsiniz.</td></tr>';
        return;
    }

    tbody.innerHTML = currentOfferItems.map(item => {
        const subtotal = item.quantity * item.price;
        const afterDiscount = subtotal;
        const taxAmount = afterDiscount * (item.tax / 100);
        const total = afterDiscount + taxAmount;

        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.unit}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <!-- İskonto hücresi kaldırıldı -->
                <td>${formatCurrency(afterDiscount)}</td>
                <td>%${item.tax} (${formatCurrency(taxAmount)})</td>
                <td><strong>${formatCurrency(total)}</strong></td>
                <td>
                    <button class="btn btn-danger btn-icon" onclick="removeOfferItem('${item.id}')">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function removeOfferItem(id) {
    currentOfferItems = currentOfferItems.filter(item => item.id !== id);
    renderOfferItems();
    calculateTotals();
}

function calculateTotals() {
    let subtotal = 0;
    let totalTax = 0;

    currentOfferItems.forEach(item => {
        const itemSubtotal = item.quantity * item.price;
        const afterDiscount = itemSubtotal;
        const taxAmount = afterDiscount * (item.tax / 100);

        subtotal += itemSubtotal;
        totalTax += taxAmount;
    });

    const grandTotal = subtotal + totalTax;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('totalTax').textContent = formatCurrency(totalTax);
    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);
}

function saveOffer() {
    const customerName = document.getElementById('customerName').value.trim();
    
    if (!customerName) {
        alert('Lütfen müşteri adını girin.');
        return;
    }

    if (currentOfferItems.length === 0) {
        alert('Lütfen en az bir ürün ekleyin.');
        return;
    }

    const offer = {
        customer: {
            name: customerName,
            taxNo: document.getElementById('customerTaxNo').value,
            address: document.getElementById('customerAddress').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value
        },
        items: currentOfferItems,
        notes: document.getElementById('offerNotes').value,
        totals: {
            subtotal: parseFloat(document.getElementById('subtotal').textContent.replace(/[^\d,]/g, '').replace(',', '.')),
            tax: parseFloat(document.getElementById('totalTax').textContent.replace(/[^\d,]/g, '').replace(',', '.')),
            total: parseFloat(document.getElementById('grandTotal').textContent.replace(/[^\d,]/g, '').replace(',', '.'))
        }
    };

    storage.addOffer(offer);
    showNotification('Teklif başarıyla kaydedildi.', 'success');
    clearOffer();

    // Navigate to History view so the user sees the saved offer
    const historyBtn = document.querySelector('[data-section="history"]');
    if (historyBtn) {
        historyBtn.click();
    } else if (typeof renderHistory === 'function') {
        renderHistory();
    }
}

function clearOffer() {
    currentOfferItems = [];
    document.getElementById('customerName').value = '';
    document.getElementById('customerTaxNo').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('offerNotes').value = '';
    
    renderOfferItems();
    calculateTotals();
}

// ==================== HISTORY ====================

function renderHistory() {
    const offers = storage.getOffers();
    const grid = document.getElementById('historyGrid');

    if (offers.length === 0) {
        grid.innerHTML = '<div class="empty-state-card"><p>Henüz kaydedilmiş teklif bulunmuyor.</p></div>';
        return;
    }

    grid.innerHTML = offers.map(offer => `
        <div class="history-card">
            <div class="history-card-header">
                <div>
                    <h3>${offer.offerNo}</h3>
                    <div class="history-card-date">${formatDate(offer.date)}</div>
                </div>
            </div>
            <div class="history-card-info">
                <p><strong>Müşteri:</strong> ${offer.customer.name}</p>
                <p><strong>Ürün Sayısı:</strong> ${offer.items.length}</p>
            </div>
            <div class="history-card-total">
                ${formatCurrency(offer.totals.total)}
            </div>
            <div class="history-card-actions">
                <button class="btn btn-primary btn-icon" onclick="viewOffer('${offer.id}')">👁️ Görüntüle</button>
                <button class="btn btn-success btn-icon" onclick="generatePDFFromHistory('${offer.id}')">📄 PDF</button>
                <button class="btn btn-danger btn-icon" onclick="deleteOfferConfirm('${offer.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

function viewOffer(id) {
    const offer = storage.getOffers().find(o => o.id === id);
    if (!offer) return;

    // Switch to new offer section
    document.querySelector('[data-section="new-offer"]').click();

    // Load offer data
    document.getElementById('customerName').value = offer.customer.name;
    document.getElementById('customerTaxNo').value = offer.customer.taxNo || '';
    document.getElementById('customerAddress').value = offer.customer.address || '';
    document.getElementById('customerPhone').value = offer.customer.phone || '';
    document.getElementById('customerEmail').value = offer.customer.email || '';
    document.getElementById('offerNotes').value = offer.notes || '';

    currentOfferItems = [...offer.items];
    renderOfferItems();
    calculateTotals();

    showNotification('Teklif yüklendi. İsterseniz düzenleyip yeniden kaydedebilirsiniz.', 'info');
}

function deleteOfferConfirm(id) {
    if (confirm('Bu teklifi silmek istediğinizden emin misiniz?')) {
        storage.deleteOffer(id);
        showNotification('Teklif silindi!', 'success');
        renderHistory();
    }
}

// History search
document.getElementById('historySearch').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const offers = storage.getOffers();
    const filtered = offers.filter(o => 
        o.customer.name.toLowerCase().includes(searchTerm) ||
        o.offerNo.toLowerCase().includes(searchTerm)
    );

    const grid = document.getElementById('historyGrid');
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state-card"><p>Teklif bulunamadı.</p></div>';
        return;
    }

    grid.innerHTML = filtered.map(offer => `
        <div class="history-card">
            <div class="history-card-header">
                <div>
                    <h3>${offer.offerNo}</h3>
                    <div class="history-card-date">${formatDate(offer.date)}</div>
                </div>
            </div>
            <div class="history-card-info">
                <p><strong>Müşteri:</strong> ${offer.customer.name}</p>
                <p><strong>Ürün Sayısı:</strong> ${offer.items.length}</p>
            </div>
            <div class="history-card-total">
                ${formatCurrency(offer.totals.total)}
            </div>
            <div class="history-card-actions">
                <button class="btn btn-primary btn-icon" onclick="viewOffer('${offer.id}')">👁️ Görüntüle</button>
                <button class="btn btn-success btn-icon" onclick="generatePDFFromHistory('${offer.id}')">📄 PDF</button>
                <button class="btn btn-danger btn-icon" onclick="deleteOfferConfirm('${offer.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
});

// ==================== PDF GENERATION ====================

// Ortak PDF stilleri
const pdfStyles = {
    titleRight: { fontSize: 20, bold: true, color: '#303030', letterSpacing: 0.6 },
    companyName: { bold: true, fontSize: 11, lineHeight: 1.35, color: '#303a44' },
    boxTitle: { bold: true, fontSize: 9, color: '#4d4d4d', margin: [0, 0, 0, 2], lineHeight: 1.2 },
    boxTitleBold: { bold: true, fontSize: 9.5, color: '#303a44', margin: [0, 0, 0, 4], lineHeight: 1.25 },
    tableHeader: { bold: true, fontSize: 7.4, color: '#303a44', lineHeight: 1.3 },
    tableBody: { fontSize: 7.4, color: '#303030' },
    customerInfo: { fontSize: 10, bold: true, lineHeight: 1.25, color: '#2d2d2d' },
    fieldLabel: { fontSize: 8, bold: true, color: '#303a44' },
    customerDetail: { fontSize: 8, lineHeight: 1.35, color: '#555' },
    summaryLabel: { fontSize: 8, lineHeight: 1.45, bold: true, color: '#303a44' },
    summaryValue: { fontSize: 8, lineHeight: 1.45, alignment: 'right', bold: true, color: '#2d2d2d' },
    summaryLabelBold: { fontSize: 8.5, lineHeight: 1.45, bold: true, color: '#303a44' },
    summaryValueBold: { fontSize: 8.5, lineHeight: 1.45, alignment: 'right', bold: true, color: '#2d2d2d' },
    notes: { fontSize: 8, lineHeight: 1.35, italics: true, color: '#666' },
    info: { fontSize: 8, lineHeight: 1.3, color: '#2d2d2d' },
    lineSeperator: { fontSize: 8, color: '#bbb' }
};


async function generatePDFFromHistory(offerId) {
    const offer = storage.getOffers().find(o => o.id === offerId);
    if (!offer) return;

    console.log('History PDF oluşturma başladı, pdfMake:', typeof window.pdfMake);

    showNotification('PDF oluşturuluyor...', 'info');

    const company = storage.getCompany();

    if (window.pdfMake) {
        try {
            const columnsHeader = {
                columns: [
                    {
                        width: 330,
                        stack: [
                            company.logo ? { image: company.logo, width: 228, margin: [0, 0, 0, 8] } : {},
                            { text: company.name || 'Firma Adı', style: 'companyName', margin: [0, 0, 0, 6] },
                            company.address ? { text: company.address, style: 'customerDetail', margin: [0, 0, 0, 6] } : {},
                            company.phone ? { text: company.phone, style: 'customerDetail', margin: [0, 0, 0, 6] } : {},
                            company.email ? { text: company.email, style: 'customerDetail', margin: [0, 0, 0, 6] } : {},
                            company.taxNo ? { stack: [ { text: 'Vergi No:', style: 'fieldLabel' }, { text: company.taxNo || '', style: 'customerDetail', margin: [0, 0, 0, 8] } ] } : {}
                        ]
                    },
                    {
                        width: 170,
                        alignment: 'left',
                        stack: [
                            { text: 'TEKLİF', style: 'titleRight', alignment: 'right', margin: [0, 0, 0, 8] },
                            { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 170, y2: 0, lineWidth: 1.2, lineColor: '#b3b3b3' } ], margin: [0, 0, 0, 10] },
                            { text: 'MÜŞTERİ', style: 'boxTitleBold', margin: [0, 0, 0, 6], alignment: 'left' },
                            { text: offer.customer.name, style: 'customerInfo', margin: [0, 0, 0, 6], alignment: 'left' },
                            offer.customer.address ? { text: offer.customer.address, style: 'customerDetail', margin: [0, 0, 0, 6], alignment: 'left' } : {},
                            offer.customer.phone ? { text: offer.customer.phone, style: 'customerDetail', margin: [0, 0, 0, 6], alignment: 'left' } : {},
                            offer.customer.email ? { text: offer.customer.email, style: 'customerDetail', margin: [0, 0, 0, 6], alignment: 'left' } : {},
                            offer.customer.taxNo ? { stack: [ { text: 'Vergi No:', style: 'fieldLabel' }, { text: offer.customer.taxNo || '', style: 'customerDetail', margin: [0, 0, 0, 8], alignment: 'left' } ] } : {},
                            { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 170, y2: 0, lineWidth: 1, lineColor: '#b3b3b3' } ], margin: [0, 6, 0, 6] },
                            { columns: [
                                { text: 'TEKLİF TARİHİ', style: 'boxTitle', fontSize: 8, margin: [0, 0, 8, 0], alignment: 'left' },
                                { text: new Date(offer.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }), style: 'customerInfo', alignment: 'right' }
                              ], margin: [0, 4, 0, 6] },
                            
                        ]
                    }
                ],
                columnGap: 15
            };

            const tableBody = [
                [
                    { text: 'Hizmet / Ürün', style: 'tableHeader' },
                    { text: 'Miktar', style: 'tableHeader', alignment: 'center' },
                    { text: 'Br. Fiyat', style: 'tableHeader', alignment: 'right' },
                    { text: 'KDV', style: 'tableHeader', alignment: 'center' },
                    { text: 'Toplam', style: 'tableHeader', alignment: 'right' }
                ],
                ...offer.items.map(item => {
                    const subtotal = item.quantity * item.price;
                    const afterDiscount = subtotal;
                    const taxAmount = afterDiscount * (item.tax / 100);
                    const total = afterDiscount + taxAmount;
                    return [
                        { text: item.name, style: 'tableBody' },
                        { text: `${item.quantity} ${item.unit}`, style: 'tableBody', alignment: 'center' },
                        { text: formatCurrency(item.price), style: 'tableBody', alignment: 'right' },
                        { text: `%${item.tax}`, style: 'tableBody', alignment: 'center' },
                        { text: formatCurrency(total), style: 'tableBody', alignment: 'right' }
                    ];
                })
            ];

            const docDefinition = {
                pageSize: 'A4',
                pageMargins: [40, 40, 40, 60],
                defaultStyle: { font: 'Roboto' },
                content: [
                    columnsHeader,
                    { text: ' ', margin: [0, 16] },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', 80, 80, 60, 90],
                            body: tableBody
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                if (i === 0 || i === node.table.body.length) return 0;
                                if (i === 1) return 1;
                                return 0;
                            },
                            vLineWidth: function () { return 0; },
                            hLineColor: function (i) { return '#b3b3b3'; },
                            paddingLeft: function () { return 6; },
                            paddingRight: function () { return 6; },
                            paddingTop: function () { return 5; },
                            paddingBottom: function () { return 5; }
                        }
                    },
                    { text: ' ', margin: [0, 16] },
                    {
                        columns: [
                            { width: '*', text: '' },
                            {
                                width: 200,
                                stack: [
                                    { columns: [{ text: 'ARA TOPLAM', style: 'summaryLabel', width: '*' }, { text: formatCurrency(offer.totals.subtotal), style: 'summaryValue', width: 'auto' }], margin: [0, 0, 0, 6] },
                                    // BRUT TOPLAM kaldırıldı
                                    { columns: [{ text: 'TOPLAM K.D.V', style: 'summaryLabel', width: '*' }, { text: formatCurrency(offer.totals.tax), style: 'summaryValue', width: 'auto' }], margin: [0, 0, 0, 10] },
                                    { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1, lineColor: '#b3b3b3' } ], margin: [0, 2, 0, 6] },
                                    { columns: [{ text: 'GENEL TOPLAM', style: 'summaryLabelBold', width: '*' }, { text: formatCurrency(offer.totals.total), style: 'summaryValueBold', width: 'auto' }], margin: [0, 0, 0, 0] }
                                ]
                            }
                        ]
                    },
                    offer.notes ? { text: `Notlar: ${offer.notes}`, style: 'notes', margin: [0, 16, 0, 0] } : {}
                ],
                styles: pdfStyles,
                footer: function(currentPage, pageCount) {
                    const pageText = (pageCount && pageCount > 1) ? `Sayfa ${currentPage} / ${pageCount}` : `Sayfa ${currentPage}`;
                    return { text: pageText, style: 'info', alignment: 'right', margin: [40, 0, 40, 0] };
                }
            };

            const fileName = `Teklif_${offer.offerNo}_${new Date(offer.date).toISOString().split('T')[0]}.pdf`;
            pdfMake.createPdf(docDefinition).download(fileName);
            showNotification('PDF başarıyla oluşturuldu!', 'success');
            return;
        } catch (e) {
            console.error('pdfmake hatası:', e.message, e);
            showNotification('PDF oluşturmada hata: ' + e.message, 'error');
        }
    }

    // Fallback
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text('PDF oluşturmada hata oluştu. Lütfen tekrar deneyin.', 15, 20);
        doc.save(`Teklif_${offer.offerNo}.pdf`);
        showNotification('PDF (basit modu) oluşturuldu.', 'warning');
    } catch (err) {
        console.error('PDF hatası:', err.message, err);
        showNotification('PDF indirilemiyor: ' + err.message, 'error');
    }
}

// ==================== DATA EXPORT/IMPORT ====================

document.querySelector('.btn-export-data').addEventListener('click', function() {
    const data = storage.exportAllData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teklif-verileri-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showNotification('Veriler dışa aktarıldı!', 'success');
});

document.querySelector('.btn-import-data').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                
                if (confirm('Mevcut veriler değiştirilecek. Devam etmek istediğinizden emin misiniz?')) {
                    storage.importAllData(data);
                    showNotification('Veriler içe aktarıldı! Sayfa yenileniyor...', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (error) {
                alert('Geçersiz veri dosyası!');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
});

// ==================== UTILITY FUNCTIONS ====================

function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Simple notification (you can enhance this with a library)
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#2563eb'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== EVENT LISTENERS ====================

// Company
document.getElementById('saveCompany').addEventListener('click', saveCompanyInfo);

// Products
document.getElementById('addNewProduct').addEventListener('click', () => openProductModal());
document.getElementById('saveProductModal').addEventListener('click', saveProductFromModal);

// Modal close
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeProductModal);
});

document.getElementById('productModal').addEventListener('click', function(e) {
    if (e.target === this) closeProductModal();
});

// Offer
document.getElementById('addProduct').addEventListener('click', addProductToOffer);
document.getElementById('saveOffer').addEventListener('click', saveOffer);
document.getElementById('clearOffer').addEventListener('click', clearOffer);

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    loadProductsDropdown();
    loadCompanyForm();
    
    // Load any saved draft
    const draft = storage.getCurrentOffer();
    if (draft) {
        // Optionally restore draft
    }

    console.log('✅ Fiyat Teklifi Uygulaması hazır!');
});
