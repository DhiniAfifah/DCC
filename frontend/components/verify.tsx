"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useLanguage } from "@/context/LanguageContext"
import { ShieldCheck, User, Clock, Hash, Download, Loader2, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface VerificationData {
    certificate_number: string
    signed_by: string
    signature_timestamp: string
    valid: boolean
    signed: boolean
    message: string
}

export function Verify({
    certificateId,
    className,
    ...props
}: React.ComponentProps<"div"> & {
    certificateId: string
}) {
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<VerificationData | null>(null)

    useEffect(() => {
        const fetchVerificationData = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(
                    `http://127.0.0.1:8000/api/verify/${certificateId}`
                )

                if (!response.ok) {
                    throw new Error("Failed to verify certificate")
                }

                const result = await response.json()
                setData(result)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
                toast.error(t("verification_failed"))
            } finally {
                setLoading(false)
            }
        }

        if (certificateId) {
            fetchVerificationData()
        }
    }, [certificateId, t])

    const handleDownload = async () => {
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/download-dcc-pdf/${certificateId}`
            )

            if (!response.ok) {
                throw new Error("Failed to download PDF")
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${certificateId}_${data?.certificate_number}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success(t("download_success"))
        } catch (err) {
            toast.error(t("download_failed"))
        }
    }

    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp)
            return new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }).format(date)
        } catch {
            return timestamp
        }
    }

    if (loading) {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                {t("loading")}...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card>
                    <CardHeader className="text-center pb-6">
                        <div className="relative inline-block mx-auto mt-4 mb-6">
                            <div className="absolute inset-0 bg-red-100 rounded-full scale-150" />
                            <AlertCircle className="relative text-red-600 w-12 h-12" />
                        </div>
                        <CardTitle className="text-2xl">{t("verification_failed")}</CardTitle>
                        <CardDescription>
                            {error || t("certificate_not_found")}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const isValid = data.valid && data.signed

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center pb-6">
                    <div className="relative inline-block mx-auto mt-4 mb-6">
                        <div
                            className={cn(
                                "absolute inset-0 rounded-full scale-150",
                                isValid ? "bg-green-100" : "bg-red-100"
                            )}
                        />
                        {isValid ? (
                            <ShieldCheck className="relative text-green-600 w-12 h-12" />
                        ) : (
                            <AlertCircle className="relative text-red-600 w-12 h-12" />
                        )}
                    </div>
                    <CardTitle className="text-2xl">
                        {isValid ? t("verification") : t("verification_failed")}
                    </CardTitle>
                    <CardDescription>
                        {isValid
                            ? t("this_page")
                            : data.message}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-7 px-6 pb-6">
                    <div className="space-y-3">
                        <InfoRow
                            label={t("sertifikat")}
                            value={data.certificate_number}
                            icon={<Hash className="w-5 h-5" />}
                        />
                        <InfoRow
                            label={t("signer_name")}
                            value={data.signed_by || "-"}
                            icon={<User className="w-5 h-5" />}
                        />
                        <InfoRow
                            label={t("timestamp")}
                            value={
                                data.signature_timestamp
                                    ? formatTimestamp(data.signature_timestamp)
                                    : "-"
                            }
                            icon={<Clock className="w-5 h-5" />}
                        />
                    </div>

                    {isValid && (
                        <div className="flex justify-center">
                            <Button
                                variant="blue"
                                className="shadow-lg hover:shadow-xl"
                                onClick={handleDownload}
                            >
                                <Download className="mr-1 h-5 w-5" />
                                {t("download")} DCC
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function InfoRow({
    label,
    value,
    icon,
}: {
    label: string
    value: string
    icon?: React.ReactNode
}) {
    return (
        <div className="flex flex-row items-center gap-4 p-4 rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 to-muted/50 hover:from-muted/50 hover:to-muted/70 transition-all duration-200 hover:shadow-sm">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase">{label}</span>
                <span className="font-semibold">{value}</span>
            </div>
        </div>
    )
}