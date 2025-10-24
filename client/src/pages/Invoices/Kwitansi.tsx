interface Invoice {
  invoice_code: string;
  invoice_nominal: number;
  invoice_date: string;
  invoice_type: "siptu" | "heregistrasi";
  pedagang: {
    CUST_NAMA: string;
    CUST_ID?: string;
  };
  pasar: {
    pasar_nama: string;
    pasar_logo?: string | null;
    pasar_alamat?: string;
    pasar_telp?: string;
    pasar_fax?: string;
    pasar_email?: string;
  };
  invoice_lapak: string[]; // Tetap ada sebagai fallback
  lapakDetails?: {
    LAPAK_CODE: string;
    LAPAK_NAMA: string;
    LAPAK_BLOK: string;
  }[];
}

interface KwitansiProps {
  invoice: Invoice;
}

// Fungsi untuk mengubah angka menjadi terbilang Rupiah
const terbilang = (n: number): string => {
  if (n < 0) return "minus " + terbilang(Math.abs(n));
  const satuan = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
  ];
  const belasan = [
    "sepuluh",
    "sebelas",
    "dua belas",
    "tiga belas",
    "empat belas",
    "lima belas",
    "enam belas",
    "tujuh belas",
    "delapan belas",
    "sembilan belas",
  ];
  const puluhan = [
    "",
    "",
    "dua puluh",
    "tiga puluh",
    "empat puluh",
    "lima puluh",
    "enam puluh",
    "tujuh puluh",
    "delapan puluh",
    "sembilan puluh",
  ];
  const ribuan = ["", "ribu", "juta", "miliar", "triliun"];

  if (n < 10) return satuan[n];
  if (n < 20) return belasan[n - 10];
  if (n < 100)
    return (
      puluhan[Math.floor(n / 10)] + (n % 10 > 0 ? " " + satuan[n % 10] : "")
    );
  if (n < 1000)
    return (
      satuan[Math.floor(n / 100)] +
      " ratus" +
      (n % 100 > 0 ? " " + terbilang(n % 100) : "")
    );

  let i = 0;
  let result = "";
  while (n > 0) {
    const sisa = n % 1000;
    if (sisa > 0) {
      const bagian =
        i === 1 && sisa === 1 ? "seribu" : terbilang(sisa) + " " + ribuan[i];
      result = bagian.trim() + (result ? " " + result : "");
    }
    n = Math.floor(n / 1000);
    i++;
  }
  return result.trim();
};

const Kwitansi = ({ invoice }: KwitansiProps) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const nominalTerbilang = terbilang(invoice.invoice_nominal);
  const serverBaseUrl =
    import.meta.env?.VITE_SERVER_BASE_URL || "http://127.0.0.1:3001";
  const logoUrl = invoice.pasar?.pasar_logo
    ? `${serverBaseUrl}/${invoice.pasar.pasar_logo}`
    : null;

  return (
    <div
      id={`kwitansi-${invoice.invoice_code}`}
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "30px",
        width: "800px",
        margin: "auto",
        backgroundColor: "#fff",
        color: "#000",
      }}
    >
      {/* Header with Company Info */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: "10px",
          }}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              style={{ height: "60px", width: "60px", marginRight: "15px" }}
            />
          )}
          <div style={{ flexGrow: 1 }}>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              {invoice.pasar?.pasar_nama || "NAMA PERUSAHAAN"}
            </h2>
            <p style={{ margin: 0, fontSize: "11px", lineHeight: "1.5" }}>
              {invoice.pasar?.pasar_alamat || "Alamat Perusahaan"}
            </p>
            {invoice.pasar?.pasar_telp && (
              <p style={{ margin: 0, fontSize: "11px" }}>
                Telp: {invoice.pasar.pasar_telp}
                {invoice.pasar?.pasar_fax &&
                  `, Fax: ${invoice.pasar.pasar_fax}`}
                {invoice.pasar?.pasar_email &&
                  `, Email: ${invoice.pasar.pasar_email}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid #000",
          borderBottom: "2px solid #000",
          padding: "8px 0",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
          KWITANSI
        </h3>
        <div style={{ fontSize: "12px", fontWeight: "bold" }}>
          {invoice.invoice_code}
        </div>
      </div>

      {/* Content Section */}
      <div style={{ marginBottom: "20px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <tbody>
            <tr>
              <td style={{ width: "180px", padding: "4px 0" }}>
                Telah Terima Dari
              </td>
              <td style={{ padding: "4px 0" }}>:</td>
            </tr>
            <tr>
              <td></td>
              <td style={{ paddingBottom: "8px" }}>
                <div style={{ fontWeight: "bold" }}>
                  {invoice.pedagang?.CUST_ID && `[${invoice.pedagang.CUST_ID}]`}
                </div>
                <div style={{ fontWeight: "bold" }}>
                  {invoice.pedagang?.CUST_NAMA || "N/A"}
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "4px 0" }}>Besarnya Uang</td>
              <td style={{ padding: "4px 0" }}>
                :{" "}
                <span
                  style={{ fontWeight: "bold", textTransform: "capitalize" }}
                >
                  {nominalTerbilang}
                </span>
              </td>
            </tr>
            <tr>
              <td></td>
              <td style={{ fontSize: "11px", paddingBottom: "8px" }}>
                : (Harga sudah termasuk PPn 11%)
              </td>
            </tr>
            <tr>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                Untuk Pembayaran
              </td>
              <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                : {invoice.invoice_type === "siptu" ? "SIPTU" : "Heregistrasi"}
                {invoice.invoice_lapak.length > 0 &&
                  ` - Lapak: ${invoice.invoice_lapak.join(", ")}`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount and Signature Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: "30px",
          marginBottom: "30px",
        }}
      >
        <div>
          <table style={{ borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px 20px",
                    backgroundColor: "#f0f0f0",
                    fontWeight: "bold",
                    textAlign: "left",
                  }}
                >
                  Nominal
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px 20px",
                    backgroundColor: "#f0f0f0",
                    fontWeight: "bold",
                    textAlign: "left",
                  }}
                >
                  {invoice.pasar?.pasar_nama || "PERUSAHAAN"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px 20px",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Rp.{" "}
                  {new Intl.NumberFormat("id-ID").format(
                    invoice.invoice_nominal
                  )}
                </td>
                <td
                  style={{ border: "1px solid #000", padding: "8px 20px" }}
                ></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Notes */}
      <div
        style={{
          fontSize: "11px",
          marginTop: "30px",
          borderTop: "1px solid #ddd",
          paddingTop: "15px",
        }}
      >
        <p style={{ margin: "5px 0", fontWeight: "bold" }}>Keterangan</p>
        <p style={{ margin: "5px 0" }}>
          1. Pembayaran dengan Cek / Giro Dianggap sah apabila sudah di uangkan
        </p>
        <p style={{ margin: "5px 0" }}>2. Payment T/T (Rupiah)</p>

        <div
          style={{
            textAlign: "right",
            marginTop: "40px",
            fontSize: "12px",
          }}
        >
          <p style={{ margin: "5px 0", fontWeight: "bold" }}>( Admin )</p>
        </div>
      </div>

      {/* Powered by footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: "9px",
          color: "#888",
          marginTop: "20px",
          paddingTop: "10px",
          borderTop: "1px solid #eee",
        }}
      >
        Powered by Sistem Informasi Pasar
      </div>
    </div>
  );
};

export default Kwitansi;
