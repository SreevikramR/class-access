import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
	family: "Roboto",
	fonts: [
		{
			src: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf",
			fontWeight: "normal",
		},
		{
			src: "https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf",
			fontWeight: "bold",
		},
	],
});

// Create styles
const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontSize: 12,
		fontFamily: "Roboto",
	},
	header: {
		marginBottom: 30,
		textAlign: "center",
	},
	h1: {
		fontSize: 20,
		fontWeight: "bold",
	},
	h2: {
		paddingTop: 4,
		color: "#64748B",
	},

	details: {
		display: "flex",
		flexDirection: "row",
		marginBottom: 20,
	},
	detailsRow: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		width: "100%",
	},

	footer: {
		marginTop: 20,
		textAlign: "center",
		fontSize: 10,
		color: "#6c757d",
	},
});

const InvoicePDF = ({ studentName, className, teacherName, invoiceDate, reportMonth, reportYear, attendanceRecords }) => (
	<Document>
		<Page style={styles.page}>
			<View style={styles.header}>
				<Text style={styles.h1}>Student Attendance Report</Text>
				<Text style={styles.h2}>
					Summary for the month of {reportMonth} {reportYear}
				</Text>
			</View>

			<View style={styles.details}>
				<View style={styles.detailsRow}>
					<Text style={{ fontWeight: "bold", paddingBottom: 4 }}>
						Student:
					</Text>
					<Text>{ studentName }</Text>
				</View>
				<View style={styles.detailsRow}>
					<Text style={{ fontWeight: "bold", paddingBottom: 4 }}>
						Class:
					</Text>
					<Text>{ className }</Text>
				</View>
			</View>
			<View style={styles.details}>
				<View style={styles.detailsRow}>
					<Text style={{ fontWeight: "bold", paddingBottom: 4 }}>
						Teacher:
					</Text>
					<Text>{ teacherName }</Text>
				</View>
				<View style={styles.detailsRow}>
					<Text style={{ fontWeight: "bold", paddingBottom: 4 }}>
						Report Date:
					</Text>
					<Text>{ invoiceDate }</Text>
				</View>
			</View>

			<View>
				<Text style={{ fontWeight: "bold", paddingBottom: 4, marginTop: 20 }}>
					Attendance Records:
				</Text>
				<View style={{ display: "flex", flexDirection: "column" }}>
					<View
						style={{
							display: "flex",
							flexDirection: "row",
							borderBottom: "1px solid #64748B",
							paddingBottom: "12px",
							paddingTop: "12px",
							fontWeight: "bold",
						}}
					>
						<Text style={{ flexBasis: "60%", paddingLeft: "8px" }}>
							Date
						</Text>{" "}
						<Text style={{ flexBasis: "40%" }}>Status</Text>
					</View>
					{attendanceRecords.map((item, index) => (
				        <View
				          key={index}
				          style={{
				            display: "flex",
				            flexDirection: "row",
				            borderBottomWidth: 1,
				            borderBottomColor: "#64748B",
				            paddingBottom: 12,
				            paddingTop: 12,
				          }}
				        >
				          <Text style={{ flexBasis: "60%", paddingLeft: 8 }}>{item.date}</Text>
				          <Text style={{ flexBasis: "40%" }}>
				            {item.isPresent ? "Present" : "Absent"}
				          </Text>
				        </View>
				    ))}
				</View>
			</View>

			<Text style={styles.footer}>Powered by Class Access</Text>
		</Page>
	</Document>
);

export default InvoicePDF;
